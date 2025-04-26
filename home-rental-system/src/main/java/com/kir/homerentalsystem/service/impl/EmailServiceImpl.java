package com.kir.homerentalsystem.service.impl;

import com.kir.homerentalsystem.constant.AuthEmailType;
import com.kir.homerentalsystem.dto.request.SendSimpleEmailRequest;
import com.kir.homerentalsystem.entity.Account;
import com.kir.homerentalsystem.exception.AppException;
import com.kir.homerentalsystem.exception.ErrorCode;
import com.kir.homerentalsystem.repository.AccountRepository;
import com.kir.homerentalsystem.service.EmailService;
import com.kir.homerentalsystem.service.kafka.producer.EmailProducer;
import com.kir.homerentalsystem.util.AuthUtil;
import com.kir.homerentalsystem.util.OtpCodeUtil;
import com.kir.homerentalsystem.util.ValidationUtil;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, Object> redisTemplate;
    private final EmailProducer emailProducer;

    @Value("${front-end.login-api-url}")
    private String loginApiUrl;

    @Value("${front-end.confirm-password-reset-url}")
    private String confirmPasswordResetUrl;

    @Override
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true); // true = HTML

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendEmailWithAttachment(String to, String subject, String text, String attachmentPath, String attachmentName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true);

            // Thêm file đính kèm
            FileSystemResource file = new FileSystemResource(new File(attachmentPath));
            helper.addAttachment(attachmentName, file);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendEmailForAuth(String email, AuthEmailType type) {
        if (!ValidationUtil.isValidEmail(email)) {
            throw new AppException(ErrorCode.INVALID_EMAIL_FORMAT);
        }

        // Tìm tài khoản theo email, nếu không tồn tại thì ném ngoại lệ
        Account account = accountRepository
                .findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        switch (type) {
            case REGISTER -> {
                // Kiểm tra xem tài khoản đã được kích hoạt chưa, nếu đã kích hoạt thì ném ngoại lệ
                if (account.getIsActive()) {
                    throw new AppException(ErrorCode.ACCOUNT_ACTIVATION_CONFLICT);
                }
                // Tạo mã OTP ngẫu nhiên
                String otpCode = OtpCodeUtil.generateOtpCode();
                try {

                    // Đọc template HTML từ file
                    String htmlTemplate = readTemplateFromFile("templates/otp-email-template.html");

                    // Thay thế các placeholder trong template với thông tin cụ thể
                    String htmlContent = htmlTemplate
                            .replace("{username}", account.getFirstName()) // Thay thế tên người dùng
                            .replace("{otpCode}", otpCode) // Thay thế mã OTP
                            .replace("{loginUrl}", loginApiUrl); // Thay thế URL đăng nhập

                    // Đặt tiêu đề email
                    String subject = "Mã xác thực OTP - Home Rental System";

                    // Gửi email với nội dung HTML đã tạo
                    emailProducer.sendOtpEmail(SendSimpleEmailRequest.builder()
                            .to(account.getEmail())
                            .subject(subject)
                            .text(htmlContent)
                            .build());
                } catch (IOException e) {
                    // Xử lý ngoại lệ khi không thể đọc template hoặc gửi email
                    throw new AppException(ErrorCode.SEND_OTP_FAILED);
                }

                // Lưu mã OTP vào Redis với thời gian hết hạn 10 phút
                redisTemplate.opsForValue().set("otp_" + email, otpCode, Duration.ofMinutes(10));

            }
            case FORGOT_PASSWORD -> {
                String tempPassword = AuthUtil.generateRandomPassword();

                String tempPasswordHash = passwordEncoder.encode(tempPassword);
                String code = AuthUtil.generateRandomCode();
                redisTemplate.opsForValue().set("forgot_password_" + email, tempPasswordHash, Duration.ofHours(1));
                redisTemplate.opsForValue().set("code_forgot_password_" + email, code, Duration.ofHours(1));
                try {
                    String htmlTemplate = readTemplateFromFile("templates/new-password-email-template.html");

                    String htmlContent = htmlTemplate
                            .replace("{username}", account.getFirstName())
                            .replace("{newPassword}", tempPassword)
                            .replace("{confirmPasswordUrl}", confirmPasswordResetUrl + email + "&code=" + code);

                    emailProducer.sendOtpEmail(SendSimpleEmailRequest.builder()
                            .to(account.getEmail())
                            .subject("Mật khẩu mới - Home Rental System")
                            .text(htmlContent)
                            .build());

                } catch (IOException e) {
                    throw new AppException(ErrorCode.SEND_NEW_PASSWORD_FAILED);
                }

            }
        }
    }
    /**
     * Đọc nội dung tệp template từ classpath resources
     *
     * @param templatePath đường dẫn tương đối trong thư mục resources
     * @return Nội dung tệp dưới dạng chuỗi
     * @throws IOException nếu không thể đọc tệp
     */
    private String readTemplateFromFile(String templatePath) throws IOException {
        ClassPathResource resource = new ClassPathResource(templatePath);
        try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)) {
            return FileCopyUtils.copyToString(reader);
        }
    }

}