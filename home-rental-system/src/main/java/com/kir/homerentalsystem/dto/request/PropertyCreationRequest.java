package com.kir.homerentalsystem.dto.request;

import com.kir.homerentalsystem.entity.Amenity;
import com.kir.homerentalsystem.entity.Location;
import com.kir.homerentalsystem.entity.PropertyImage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
public class PropertyCreationRequest {
    @NotNull
    private Long categoryId;

    @NotNull
    private Location location;

    @NotBlank
    private String title;

    private String description;

    @NotNull
    @Positive
    private Integer bedrooms;

    @NotNull
    @Positive
    private Integer bathrooms;

    @NotNull
    @Positive
    private BigDecimal area;

    @NotNull
    @Positive
    private BigDecimal pricePerMonth;

    private BigDecimal securityDeposit;

    List<AmenityRequest> amenities;
    List<PropertyImageRequest> propertyImages;
}
