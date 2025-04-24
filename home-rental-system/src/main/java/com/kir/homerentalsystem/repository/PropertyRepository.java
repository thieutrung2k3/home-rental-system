package com.kir.homerentalsystem.repository;

import com.kir.homerentalsystem.dto.response.PropertyResponse;
import com.kir.homerentalsystem.entity.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {
    Optional<Property> findByOwner_Account_Email(String email);
    Page<Property> findAllByOwner_Account_Email(Pageable pageable, String email);
    Page<Property> findAll(Pageable pageable);
    Page<Property> findAllByCategory_CategoryId(Pageable pageable, Long categoryId);
    Page<Property> findAllByLocation_LocationId(Pageable pageable, Long locationId);
}
