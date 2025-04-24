package com.kir.homerentalsystem.mapper;

import com.kir.homerentalsystem.dto.response.PropertyImageResponse;
import com.kir.homerentalsystem.entity.PropertyImage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PropertyImageMapper {
    PropertyImageResponse toPropertyImageResponse(PropertyImage propertyImage);
}
