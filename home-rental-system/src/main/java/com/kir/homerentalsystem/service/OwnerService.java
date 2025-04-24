package com.kir.homerentalsystem.service;

import com.kir.homerentalsystem.dto.request.VerifyOwnerRequest;

public interface OwnerService {
    void verifyOwner(VerifyOwnerRequest request);

}
