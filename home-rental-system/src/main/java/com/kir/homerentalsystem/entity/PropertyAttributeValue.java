package com.kir.homerentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "property_attribute_value")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyAttributeValue {
    @EmbeddedId
    private PropertyAttributeValueId id = new PropertyAttributeValueId();

    @ManyToOne
    @MapsId("propertyId")
    @JoinColumn(name = "property_id")
    private Property property;

    @ManyToOne
    @MapsId("attributeId")
    @JoinColumn(name = "attribute_id")
    private PropertyAttribute attribute;

    @Column(nullable = false)
    private String value;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PropertyAttributeValue that = (PropertyAttributeValue) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id == null ? 31 : id.hashCode();
    }
    
    @Override
    public String toString() {
        return "PropertyAttributeValue{" +
                "id=" + id +
                ", value='" + value + '\'' +
                '}';
    }
}