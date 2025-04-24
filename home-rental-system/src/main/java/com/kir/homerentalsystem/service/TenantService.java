package com.kir.homerentalsystem.service;

import com.kir.homerentalsystem.dto.request.VerifyTenantRequest;

public interface TenantService {
    void verifyTenant(VerifyTenantRequest request);
}
