package com.kir.homerentalsystem.repository;

import com.kir.homerentalsystem.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> {
}
