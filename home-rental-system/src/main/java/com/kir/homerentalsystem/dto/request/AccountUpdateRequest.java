package com.kir.homerentalsystem.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountUpdateRequest {
    @NotBlank(message = "Vui lòng nhập họ")
    private String firstName;

    @NotBlank(message = "Vui lòng nhập tên")
    private String lastName;

    @NotBlank(message = "Vui lòng nhập số điện thoại")
    private String phoneNumber;

    // Dành cho chủ sở hữu (OWNER)
    private String companyName;
    private String taxId;

    // Dành cho người thuê (TENANT)
    private LocalDate dateOfBirth;
    private String occupation;
    private BigDecimal income;
}
