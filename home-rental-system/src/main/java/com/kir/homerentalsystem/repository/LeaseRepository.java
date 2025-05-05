package com.kir.homerentalsystem.repository;

import com.kir.homerentalsystem.entity.Lease;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LeaseRepository extends JpaRepository<Lease, Long> {
    Optional<Lease> findByProperty_PropertyIdAndStatus(Long propertyId, String status);
    List<Lease> findAllByStatusAndStartDate(String status, LocalDate startDate);
    List<Lease> findAllByProperty_Owner_Account_EmailAndStatus(String email, String status);
    List<Lease> findAllByProperty_Owner_OwnerIdAndStatus(Long ownerId, String status);
    boolean existsByProperty_PropertyIdAndStatusIn(Long propertyId, List<String> status);
}
