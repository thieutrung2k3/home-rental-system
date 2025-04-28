package com.kir.homerentalsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaseResponse {
    private Long leaseId;
    private Long propertyId;
    private Long accountId;
    private Long startTime;
    private Long endTime;
    private BigDecimal monthlyRent;
    private BigDecimal securityDeposit;
    private String leaseTerms;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
