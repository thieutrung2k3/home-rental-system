package com.kir.homerentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "property_attribute")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PropertyAttribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attribute_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "data_type", nullable = false)
    private String dataType;  // 'NUMBER', 'TEXT', 'BOOLEAN', 'DATE'

    private String unit;

    private String description;

    @OneToMany(mappedBy = "attribute", cascade = CascadeType.ALL)
    private Set<CategoryAttribute> categoryAttributes = new HashSet<>();

    @OneToMany(mappedBy = "attribute", cascade = CascadeType.ALL)
    private Set<PropertyAttributeValue> attributeValues = new HashSet<>();
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PropertyAttribute that = (PropertyAttribute) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id == null ? 31 : id.hashCode();
    }
    
    @Override
    public String toString() {
        return "PropertyAttribute{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", dataType='" + dataType + '\'' +
                ", unit='" + unit + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}