package com.kir.homerentalsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
@Entity
@Table(name = "tenant")
@Data
@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
public class Tenant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tenant_id")
    private Long tenantId;
    
    @OneToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "occupation")
    private String occupation;
    
    @Column(name = "income")
    private BigDecimal income;
    
    @Column(name = "verification_status")
    private String verificationStatus = "PENDING";
}