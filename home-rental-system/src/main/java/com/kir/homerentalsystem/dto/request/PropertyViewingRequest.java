package com.kir.homerentalsystem.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PropertyViewingRequest {
    private Long propertyId;
    private LocalDateTime viewingDate;
    private String notes;
}
