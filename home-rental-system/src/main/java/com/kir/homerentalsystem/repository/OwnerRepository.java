package com.kir.homerentalsystem.repository;

import com.kir.homerentalsystem.entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Long> {
    Optional<Owner> findByAccount_AccountId(Long accountAccountId);
    Optional<Owner> findByAccount_Email(String email);
}
