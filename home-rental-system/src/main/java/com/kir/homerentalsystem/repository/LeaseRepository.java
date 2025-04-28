package com.kir.homerentalsystem.repository;

import com.kir.homerentalsystem.entity.Lease;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LeaseRepository extends JpaRepository<Lease, Long> {
    Optional<Lease> findByProperty_PropertyIdAndStatus(Long propertyId, String status);
}
