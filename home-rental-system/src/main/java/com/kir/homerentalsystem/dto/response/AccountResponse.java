package com.kir.homerentalsystem.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.kir.homerentalsystem.entity.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountResponse {
    Long accountId;
    String email;
    String firstName;
    String lastName;
    String phoneNumber;
    Boolean isActive;
    Role role;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    // Dành cho chủ sở hữu (OWNER)
    String companyName;
    String taxId;

    // Dành cho người thuê (TENANT)
    LocalDate dateOfBirth;
    String occupation;
    BigDecimal income;
}
