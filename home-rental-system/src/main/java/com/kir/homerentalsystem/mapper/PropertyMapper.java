package com.kir.homerentalsystem.mapper;

import com.kir.homerentalsystem.dto.request.PropertyCreationRequest;
import com.kir.homerentalsystem.dto.response.PAVResponse;
import com.kir.homerentalsystem.dto.response.PropertyResponse;
import com.kir.homerentalsystem.entity.Property;
import com.kir.homerentalsystem.entity.PropertyAttributeValue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {AmenityMapper.class, PropertyImageMapper.class})
public interface PropertyMapper {
    @Mapping(target = "isAvailable", ignore = true)
    @Mapping(target = "isFeatured", ignore = true)
    Property toProperty(PropertyCreationRequest request);

    @Mapping(target = "name", source = "category.name")
    @Mapping(target = "email", source = "owner.account.email")
    @Mapping(target = "propertyAttributeValues", source = "attributeValues")
    PropertyResponse toPropertyResponse(Property property);

    @Mapping(target = "name", source = "attribute.name")
    @Mapping(target = "value", source = "value")
    PAVResponse toPAVResponse(PropertyAttributeValue propertyAttributeValue);
}
