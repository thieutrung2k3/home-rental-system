package com.kir.homerentalsystem.service.impl;

import ch.qos.logback.classic.Logger;
import com.kir.homerentalsystem.constant.VerificationStatus;
import com.kir.homerentalsystem.dto.request.VerifyTenantRequest;
import com.kir.homerentalsystem.entity.Owner;
import com.kir.homerentalsystem.entity.Tenant;
import com.kir.homerentalsystem.exception.AppException;
import com.kir.homerentalsystem.exception.ErrorCode;
import com.kir.homerentalsystem.repository.TenantRepository;
import com.kir.homerentalsystem.service.TenantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.EnumUtils;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantServiceImpl implements TenantService {
    private final TenantRepository tenantRepository;

    @Override
    public void verifyTenant(VerifyTenantRequest request) {
        String status = request.getStatus().toUpperCase();
        log.info("Verifying tenant with status: {}", status);
        if(!EnumUtils.isValidEnum(VerificationStatus.class, status)){
            throw new AppException(ErrorCode.VERIFICATION_NOT_EXISTED);
        }
        Tenant tenant = tenantRepository.findByAccount_AccountId(request.getAccountId())
                .orElseThrow(() -> new AppException(ErrorCode.OWNER_NOT_EXISTED));

        tenant.setVerificationStatus(status);
        tenantRepository.save(tenant);
    }
}
