package com.kir.homerentalsystem.repository;

import com.kir.homerentalsystem.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    Optional<Tenant> findByAccount_AccountId(Long accountAccountId);
    Optional<Tenant> findByAccount_Email(String email);
}
