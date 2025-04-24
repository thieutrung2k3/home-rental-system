package com.kir.homerentalsystem.mapper;

import com.kir.homerentalsystem.dto.request.PropertyViewingRequest;
import com.kir.homerentalsystem.dto.response.PropertyViewingResponse;
import com.kir.homerentalsystem.entity.PropertyViewing;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PropertyViewingMapper {
    PropertyViewing toPropertyViewing(PropertyViewingRequest request);
    PropertyViewingResponse toPropertyViewingResponse(PropertyViewing propertyViewing);
}
