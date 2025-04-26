package com.kir.homerentalsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "category_attribute")
@Getter
@Setter
@NoArgsConstructor
public class CategoryAttribute {
    @EmbeddedId
    private CategoryAttributeId id = new CategoryAttributeId();

    @ManyToOne
    @MapsId("categoryId")
    @JoinColumn(name = "category_id")
    private PropertyCategory category;

    @ManyToOne
    @MapsId("attributeId")
    @JoinColumn(name = "attribute_id")
    private PropertyAttribute attribute;

    @Column(name = "is_required")
    private Boolean isRequired = false;

    @Column(name = "default_value")
    private String defaultValue;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CategoryAttribute that = (CategoryAttribute) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id == null ? 31 : id.hashCode();
    }
    
    @Override
    public String toString() {
        return "CategoryAttribute{" +
                "id=" + id +
                ", isRequired=" + isRequired +
                ", defaultValue='" + defaultValue + '\'' +
                '}';
    }
}