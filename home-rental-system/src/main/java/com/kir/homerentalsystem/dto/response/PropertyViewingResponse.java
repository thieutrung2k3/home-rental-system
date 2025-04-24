package com.kir.homerentalsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PropertyViewingResponse {
    private Long viewingId;
    private AccountResponse accountResponse;
    private Long propertyId;
    private LocalDateTime viewingDate;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
