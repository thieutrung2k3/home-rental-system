package com.kir.homerentalsystem.repository;

import com.kir.homerentalsystem.entity.PropertyCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropertyCategoryRepository extends JpaRepository<PropertyCategory, Long> {
}