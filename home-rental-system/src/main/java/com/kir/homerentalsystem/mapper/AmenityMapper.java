package com.kir.homerentalsystem.mapper;

import com.kir.homerentalsystem.dto.request.AmenityRequest;
import com.kir.homerentalsystem.dto.response.AmenityResponse;
import com.kir.homerentalsystem.entity.Amenity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AmenityMapper {
    Amenity toAmenity(AmenityRequest request);
    AmenityResponse toAmenityResponse(Amenity amenity);
}
