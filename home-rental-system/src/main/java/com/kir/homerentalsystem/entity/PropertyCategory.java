package com.kir.homerentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "property_category")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long categoryId;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @OneToMany(mappedBy = "category")
    private Set<Property> properties = new HashSet<>();

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private Set<CategoryAttribute> categoryAttributes = new HashSet<>();
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PropertyCategory that = (PropertyCategory) o;
        return categoryId != null && categoryId.equals(that.categoryId);
    }

    @Override
    public int hashCode() {
        // Sử dụng ID cho hashCode, nếu ID là null (chưa được lưu) thì sử dụng giá trị mặc định
        return categoryId == null ? 31 : categoryId.hashCode();
    }
    
    @Override
    public String toString() {
        return "PropertyCategory{" +
                "categoryId=" + categoryId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}