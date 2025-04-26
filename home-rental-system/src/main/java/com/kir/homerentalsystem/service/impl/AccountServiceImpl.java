package com.kir.homerentalsystem.service.impl;

import com.kir.homerentalsystem.constant.AuthEmailType;
import com.kir.homerentalsystem.constant.IdNumberType;
import com.kir.homerentalsystem.constant.RoleConst;
import com.kir.homerentalsystem.constant.VerificationStatus;
import com.kir.homerentalsystem.dto.request.AccountCreationRequest;
import com.kir.homerentalsystem.dto.request.AccountUpdateRequest;
import com.kir.homerentalsystem.dto.request.PasswordUpdateRequest;
import com.kir.homerentalsystem.dto.response.AccountResponse;
import com.kir.homerentalsystem.entity.Account;
import com.kir.homerentalsystem.entity.Owner;
import com.kir.homerentalsystem.entity.Role;
import com.kir.homerentalsystem.entity.Tenant;
import com.kir.homerentalsystem.exception.AppException;
import com.kir.homerentalsystem.exception.ErrorCode;
import com.kir.homerentalsystem.mapper.AccountMapper;
import com.kir.homerentalsystem.repository.AccountRepository;
import com.kir.homerentalsystem.repository.OwnerRepository;
import com.kir.homerentalsystem.repository.RoleRepository;
import com.kir.homerentalsystem.repository.TenantRepository;
import com.kir.homerentalsystem.service.AccountService;
import com.kir.homerentalsystem.service.EmailService;
import com.kir.homerentalsystem.service.kafka.producer.EmailProducer;
import com.kir.homerentalsystem.util.OtpCodeUtil;
import com.kir.homerentalsystem.util.ValidationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {
    private final AccountRepository accountRepository;
    private final TenantRepository tenantRepository;
    private final OwnerRepository ownerRepository;
    private final AccountMapper accountMapper;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final EmailProducer emailProducer;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${front-end.login-api-url}")
    private String loginApiUrl;

    @Override
    @Transactional
    public AccountResponse register(AccountCreationRequest request) {
        // Tìm role và kiểm tra tồn tại
        Role role = roleRepository.findByName(request.getRoleName().toUpperCase());
        if (role == null) {
            throw new AppException(ErrorCode.ROLE_NOT_EXISTED);
        }
        log.info("Registering account with role: {}", role.getName());
        if (role.getName().equals(RoleConst.ADMIN.name())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        // Kiểm tra định dạng email
        if (!ValidationUtil.isValidEmail(request.getEmail())) {
            throw new AppException(ErrorCode.INVALID_EMAIL_FORMAT);
        }
        // Kiểm tra định dạng số điện thoại (nếu có)
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()
                && !ValidationUtil.isValidPhoneNumber(request.getPhoneNumber())) {
            throw new AppException(ErrorCode.INVALID_PHONE_FORMAT);
        }

        // Kiểm tra email đã tồn tại
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        // Tạo và cấu hình account
        Account account = accountMapper.toAccount(request);
        account.setRole(role);
        account.setIsActive(false);
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setIdNumberType(IdNumberType.valueOf(request.getIdNumberType().toUpperCase()));

        accountRepository.save(account);
        AccountResponse accountResponse = new AccountResponse();

        if (RoleConst.OWNER.name().equals(role.getName())) {
            Owner owner = Owner.builder()
                    .account(account)
                    .companyName(request.getCompanyName())
                    .taxId(request.getTaxId())
                    .verificationStatus(VerificationStatus.PENDING.name())
                    .build();
            accountResponse = accountMapper.toAccountResponseFromOwner(account, owner);
            ownerRepository.save(owner);
        } else if (RoleConst.TENANT.name().equals(role.getName())) {
            Tenant tenant = Tenant.builder()
                    .account(account)
                    .dateOfBirth(request.getDateOfBirth())
                    .occupation(request.getOccupation())
                    .income(request.getIncome())
                    .verificationStatus(VerificationStatus.PENDING.name())
                    .build();
            accountResponse = accountMapper.toAccountResponseFromTenant(account, tenant);
            tenantRepository.save(tenant);
        }
        //Gửi OTP
        String otpCode = OtpCodeUtil.generateOtpCode();
        emailService.sendEmailForAuth(account.getEmail(), AuthEmailType.REGISTER);
        redisTemplate.opsForValue().set(account.getEmail(), otpCode, Duration.ofMinutes(10));
        String value = (String) redisTemplate.opsForValue().get(account.getEmail());

        return accountResponse;
    }

    @Override
    public AccountResponse getMyInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        Account account = accountRepository
                .findByEmail(authentication.getName()).orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));
        AccountResponse accountResponse = accountMapper.toAccountResponse(account);

        if (account.getRole().getName().equals(RoleConst.OWNER.name())) {
            Owner owner = ownerRepository.findByAccount_AccountId(account.getAccountId())
                    .orElseThrow(() -> new AppException(ErrorCode.OWNER_NOT_EXISTED));
            accountResponse.setCompanyName(owner.getCompanyName());
            accountResponse.setTaxId(owner.getTaxId());
        }
        if (account.getRole().getName().equals(RoleConst.TENANT.name())) {
            Tenant tenant = tenantRepository.findByAccount_AccountId(account.getAccountId())
                    .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_EXISTED));
            accountResponse.setDateOfBirth(tenant.getDateOfBirth());
            accountResponse.setOccupation(tenant.getOccupation());
            accountResponse.setIncome(tenant.getIncome());
        }
        return accountResponse;
    }

    @Override
    public AccountResponse getAccountById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));
        return accountMapper.toAccountResponse(account);
    }

    @Override
    public List<AccountResponse> searchAccounts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        keyword = keyword.trim(); // loại bỏ khoảng trắng đầu/cuối

        List<Account> accounts = accountRepository
                .findByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrPhoneNumberContainingIgnoreCase(
                        keyword, keyword, keyword, keyword
                );

        return accounts.stream()
                .map(accountMapper::toAccountResponse)
                .collect(Collectors.toList());
    }


    @Override
    public void resetPassword(String email) {
        if (!ValidationUtil.isValidEmail(email)) {
            throw new AppException(ErrorCode.INVALID_EMAIL_FORMAT);
        }
        emailService.sendEmailForAuth(email, AuthEmailType.FORGOT_PASSWORD);
        log.info("Password reset successful for email: {}", email);
    }

    @Transactional
    @Override
    public AccountResponse updateMyInfo(AccountUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        if (email == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Account account = accountRepository
                .findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        if (request.getFirstName() != null) {
            account.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            account.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            account.setPhoneNumber(request.getPhoneNumber());
        }
        accountRepository.save(account);
        AccountResponse accountResponse = new AccountResponse();
        if(account.getRole().getName().equals(RoleConst.OWNER.name())) {
            Owner owner = ownerRepository.findByAccount_AccountId(account.getAccountId())
                    .orElseThrow(() -> new AppException(ErrorCode.OWNER_NOT_EXISTED));
            if (request.getCompanyName() != null) {
                owner.setCompanyName(request.getCompanyName());
            }
            if (request.getTaxId() != null) {
                owner.setTaxId(request.getTaxId());
            }
            accountResponse = accountMapper.toAccountResponseFromOwner(account, owner);
            ownerRepository.save(owner);
        } else if(account.getRole().getName().equals(RoleConst.TENANT.name())) {
            Tenant tenant = tenantRepository.findByAccount_AccountId(account.getAccountId())
                    .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_EXISTED));
            if (request.getDateOfBirth() != null) {
                tenant.setDateOfBirth(request.getDateOfBirth());
            }
            if (request.getOccupation() != null) {
                tenant.setOccupation(request.getOccupation());
            }
            if (request.getIncome() != null) {
                tenant.setIncome(request.getIncome());
            }
            accountResponse = accountMapper.toAccountResponseFromTenant(account, tenant);
            tenantRepository.save(tenant);
        }
        return accountResponse;
    }

    @Override
    public void deleteMyAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Long accountId = Long.valueOf(authentication.getName());
        accountRepository.deleteById(accountId);

        SecurityContextHolder.clearContext();
    }

    @Override
    public Page<AccountResponse> getAllAccounts(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<Account> responsePage = accountRepository.findAll(pageable);

        return responsePage.map(accountMapper::toAccountResponse);
    }

    @Override
    public void deleteAccount(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_EXISTED);
        }
        accountRepository.deleteById(id);
        log.info("Account with ID {} has been deleted", id);
    }

    @Override
    public void updatePassword(PasswordUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        if (email == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if(!ValidationUtil.isValidEmail(email)) {
            throw new AppException(ErrorCode.INVALID_EMAIL_FORMAT);
        }

        log.info("Updating password for email: {}", authentication.getName());

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));
        // Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_INVALID);
        }

        // Update to new password
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);

        log.info("Password updated successfully for email: {}", email);
    }
}