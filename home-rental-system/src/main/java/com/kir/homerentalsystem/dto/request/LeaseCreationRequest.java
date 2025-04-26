package com.kir.homerentalsystem.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeaseCreationRequest {
    private Long propertyId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private BigDecimal monthlyRent;
    private BigDecimal securityDeposit;
}
