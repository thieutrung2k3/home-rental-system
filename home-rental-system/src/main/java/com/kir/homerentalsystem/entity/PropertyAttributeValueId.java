package com.kir.homerentalsystem.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropertyAttributeValueId implements Serializable {
    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "attribute_id")
    private Long attributeId;
}
