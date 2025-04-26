package com.kir.homerentalsystem.service.impl;

import com.kir.homerentalsystem.constant.AuthEmailType;
import com.kir.homerentalsystem.dto.request.LoginRequest;
import com.kir.homerentalsystem.dto.request.LogoutRequest;
import com.kir.homerentalsystem.dto.request.ValidateTokenRequest;
import com.kir.homerentalsystem.dto.response.AccountResponse;
import com.kir.homerentalsystem.dto.response.LoginResponse;
import com.kir.homerentalsystem.dto.response.ValidateTokenResponse;
import com.kir.homerentalsystem.entity.*;
import com.kir.homerentalsystem.exception.AppException;
import com.kir.homerentalsystem.exception.ErrorCode;
import com.kir.homerentalsystem.mapper.AccountMapper;
import com.kir.homerentalsystem.repository.AccountRepository;
import com.kir.homerentalsystem.repository.InvalidatedTokenRepository;
import com.kir.homerentalsystem.repository.PropertyRepository;
import com.kir.homerentalsystem.repository.TenantRepository;
import com.kir.homerentalsystem.service.AuthService;
import com.kir.homerentalsystem.service.EmailService;
import com.kir.homerentalsystem.util.AuthUtil;
import com.kir.homerentalsystem.util.ValidationUtil;
import com.kir.homerentalsystem.util.WordUtil;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final AccountRepository accountRepository;
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AccountMapper accountMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private final PropertyRepository propertyRepository;
    private final TenantRepository tenantRepository;

    @NonFinal
    @Value("${jwt.valid-duration}")
    private int VALID_DURATION;

    @NonFinal
    @Value("${jwt.signerKey}")
    private String SIGNER_KEY;

    @Value("${front-end.login-api-url}")
    private String loginApiUrl;

    @Override
    public void test() {
        Property property = propertyRepository.findById(21L).orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_EXISTED));
        Tenant tenant = tenantRepository.findById(5L).orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_EXISTED));
        log.info("Property: {}", property);
        Lease lease = Lease.builder()
//                .leaseId(1L)
                .property(property)
                .tenant(tenant)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(1))
                .monthlyRent(property.getPricePerMonth())
                .securityDeposit(property.getSecurityDeposit())
                .leaseTerms("asifhasd")
                .status("PENDING")
                .build();
        log.info("Lease: {}", lease);
        ByteArrayInputStream bis = WordUtil.fillTemplate(lease);

        try {
            // Tạo thư mục nếu chưa tồn tại
            String uploadDir = "uploads/leases";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Tạo tên file dựa trên thông tin hợp đồng
            String fileName = "lease_" + lease.getLeaseId() + "_" + tenant.getTenantId() + "_" +
                    LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".docx";
            Path filePath = uploadPath.resolve(fileName);

            // Ghi file vào thư mục
            Files.copy(bis, filePath, StandardCopyOption.REPLACE_EXISTING);

            System.out.println("File saved successfully: " + filePath.toString());
        } catch (IOException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        } finally {
            try {
                bis.close();
            } catch (IOException e) {
                // Log error
                System.err.println("Error closing ByteArrayInputStream: " + e.getMessage());
            }
        }
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));
        if (!passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_INVALID);
        }
        if (!account.getIsActive()) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_ACTIVATED);
        }
        return LoginResponse.builder()
                .token(generateToken(account))
                .build();
    }

    @Override
    public void logout(LogoutRequest request) throws ParseException {
        SignedJWT signedJWT = verifyToken(request.getToken(), false);
        log.info(signedJWT.serialize());
        String tokenId = signedJWT.getJWTClaimsSet().getJWTID();
        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(tokenId)
                .expiryTime(expiryTime)
                .build();
    }

    @Override
    public ValidateTokenResponse validateToken(ValidateTokenRequest request) {
        String token = request.getToken();
        boolean isValid = true;
        try {
            verifyToken(token, true);
        } catch (Exception e) {
            isValid = false;
        }
        log.info("Validate token func: " + String.valueOf(isValid));
        return ValidateTokenResponse.builder()
                .valid(isValid)
                .build();
    }

    @Override
    public SignedJWT verifyToken(String token, boolean flag) {
        try {
            JWSVerifier jwsVerifier = new MACVerifier(SIGNER_KEY.getBytes());
            SignedJWT signedJWT = SignedJWT.parse(token);
            boolean verified = signedJWT.verify(jwsVerifier);

            if (!verified || invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
                throw new AppException(ErrorCode.UNAUTHENTICATED);


            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

            if (expiryTime.before(new Date()) && flag || !accountRepository.existsByEmail(signedJWT.getJWTClaimsSet().getSubject())) {
                invalidatedTokenRepository.save(InvalidatedToken.builder()
                        .id(signedJWT.getJWTClaimsSet().getJWTID())
                        .expiryTime(signedJWT.getJWTClaimsSet().getExpirationTime())
                        .build());
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }

            return signedJWT;
        } catch (ParseException | JOSEException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

    }

    @Override
    public String generateToken(Account account) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS256);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(account.getEmail())
                .claim("accountId", account.getAccountId())
                .issuer("dev")
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", account.getRole().getName())
                .build();
        
        try {
            // Create a signed JWT
            SignedJWT signedJWT = new SignedJWT(jwsHeader, jwtClaimsSet);
            
            // Create a signer with the secret key
            JWSSigner signer = new MACSigner(SIGNER_KEY.getBytes());
            
            // Apply the signature
            signedJWT.sign(signer);
            
            // Serialize to compact form
            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Error generating JWT token", e);
        }
    }

    @Override
    public AccountResponse validateOtpCode(String email, String otpCode, AuthEmailType type) {
        switch (type) {
            case REGISTER -> {
                Account account = accountRepository.findByEmail(email)
                        .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

                if (account.getIsActive()) {
                    throw new AppException(ErrorCode.ACCOUNT_ACTIVATION_CONFLICT);
                }

                String redisOtpCode = (String) redisTemplate.opsForValue().get("otp_" + email);
                if (redisOtpCode == null || !redisOtpCode.equals(otpCode)) {
                    throw new AppException(ErrorCode.OTP_INVALID);
                }

                redisTemplate.opsForValue().getOperations().delete(email);
                account.setIsActive(true);

                accountRepository.save(account);
                return accountMapper.toAccountResponse(account);
            }
            default -> {
                throw new AppException(ErrorCode.REQUEST_INVALID);
            }
        }
    }

    @Override
    public void confirmPasswordReset(String email, String code) {
        if(!ValidationUtil.isValidEmail(email)) {
            throw new AppException(ErrorCode.INVALID_EMAIL_FORMAT);
        }

        String redisKey = "forgot_password_" + email;
        String codeKey = "code_forgot_password_" + email;
        if(!redisTemplate.hasKey(redisKey) || !redisTemplate.hasKey(codeKey)) {
            throw new AppException(ErrorCode.PASSWORD_EXPIRED);
        }
        if(!code.equals(redisTemplate.opsForValue().get(codeKey))) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String encodedPassword = Objects.requireNonNull(redisTemplate.opsForValue().get(redisKey)).toString();

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));
        account.setPassword(encodedPassword);
        accountRepository.save(account);

        redisTemplate.opsForValue().getOperations().delete(redisKey);
        redisTemplate.opsForValue().getOperations().delete(codeKey);
        log.info("Password reset successful for email: {}", email);

    }
}