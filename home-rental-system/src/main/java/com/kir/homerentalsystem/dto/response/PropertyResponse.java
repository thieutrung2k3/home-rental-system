package com.kir.homerentalsystem.dto.response;

import com.kir.homerentalsystem.entity.*;
import jdk.jfr.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyResponse {
    private Long propertyId;
    private String email;
    private String name;
    private String address;
    private String title;
    private String description;
    private BigDecimal pricePerMonth;
    private BigDecimal securityDeposit;
    private Boolean isAvailable;
    private Boolean isFeatured;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<AmenityResponse> amenities = new HashSet<>();
    private Set<PropertyImageResponse> propertyImages = new HashSet<>();
}
