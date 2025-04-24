package com.kir.homerentalsystem.repository;

import com.kir.homerentalsystem.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AmenityRepository extends JpaRepository<Amenity, Long> {
}
