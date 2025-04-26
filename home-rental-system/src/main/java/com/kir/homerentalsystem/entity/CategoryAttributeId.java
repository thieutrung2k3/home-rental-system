package com.kir.homerentalsystem.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
public class CategoryAttributeId implements Serializable {
    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "attribute_id")
    private Long attributeId;
}