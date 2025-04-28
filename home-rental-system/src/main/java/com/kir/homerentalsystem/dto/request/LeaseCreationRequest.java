package com.kir.homerentalsystem.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeaseCreationRequest {
    private Long propertyId;
    private LocalDate startDate;
    private LocalDate endDate;
}
