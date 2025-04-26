package com.kir.homerentalsystem.repository;

import com.kir.homerentalsystem.entity.CategoryAttribute;
import com.kir.homerentalsystem.entity.CategoryAttributeId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryAttributeRepository extends JpaRepository<CategoryAttribute, CategoryAttributeId> {
    List<CategoryAttribute> findAllByCategory_CategoryId(Long categoryId);
}
