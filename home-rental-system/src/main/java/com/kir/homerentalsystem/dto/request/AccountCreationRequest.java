package com.kir.homerentalsystem.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountCreationRequest {
    @NotBlank(message = "Vui lòng nhập email")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    private String password;

    @NotBlank(message = "Vui lòng nhập họ")
    private String firstName;

    @NotBlank(message = "Vui lòng nhập tên")
    private String lastName;

    @NotBlank(message = "Vui lòng nhập số điện thoại")
    private String phoneNumber;

    @NotBlank(message = "Vui lòng chọn vai trò")
    private String roleName; // OWNER hoặc TENANT

    // Dành cho chủ sở hữu (OWNER)
    private String companyName;
    private String taxId;

    // Dành cho người thuê (TENANT)
    private LocalDate dateOfBirth;
    private String occupation;
    private BigDecimal income;
}

