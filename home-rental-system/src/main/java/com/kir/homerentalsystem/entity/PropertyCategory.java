package com.kir.homerentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Builder
@Entity
@Table(name = "property_category")
@Data
@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
public class PropertyCategory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long categoryId;
    
    @Column(name = "name", nullable = false, unique = true)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}