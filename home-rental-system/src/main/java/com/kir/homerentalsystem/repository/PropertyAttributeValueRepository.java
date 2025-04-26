package com.kir.homerentalsystem.repository;

import com.kir.homerentalsystem.entity.PropertyAttribute;
import com.kir.homerentalsystem.entity.PropertyAttributeValue;
import com.kir.homerentalsystem.entity.PropertyAttributeValueId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyAttributeValueRepository extends JpaRepository<PropertyAttributeValue, PropertyAttributeValueId> {
}
