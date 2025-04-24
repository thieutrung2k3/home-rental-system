package com.kir.homerentalsystem.mapper;

import com.kir.homerentalsystem.dto.request.PropertyCreationRequest;
import com.kir.homerentalsystem.dto.response.PropertyResponse;
import com.kir.homerentalsystem.entity.Property;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {AmenityMapper.class, PropertyImageMapper.class})
public interface PropertyMapper {
    @Mapping(target = "isAvailable", ignore = true)
    @Mapping(target = "isFeatured", ignore = true)
    Property toProperty(PropertyCreationRequest request);

    @Mapping(target = "name", source = "category.name")
    @Mapping(target = "email", source = "owner.account.email")
    PropertyResponse toPropertyResponse(Property property);
}
