package com.kir.homerentalsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaseResponse {
    private Long leaseId;
    private Long propertyId;
    private Long accountId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyRent;
    private BigDecimal securityDeposit;
    private String leaseTerms;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
