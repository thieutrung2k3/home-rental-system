package com.kir.homerentalsystem.repository;

import com.kir.homerentalsystem.constant.PropertyViewingStatus;
import com.kir.homerentalsystem.entity.PropertyViewing;
import com.kir.homerentalsystem.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PropertyViewingRepository extends JpaRepository<PropertyViewing, Long> {
    Optional<PropertyViewing> findByProperty_PropertyIdAndTenant_TenantId(Long propertyPropertyId, Long tenantId);
    Boolean existsByProperty_PropertyIdAndTenant_TenantIdAndStatusIn(Long property_propertyId, Long tenant_tenantId, Collection<String> status);
}
