package com.kir.homerentalsystem.service;

import com.kir.homerentalsystem.dto.request.VerifyOwnerRequest;
import com.kir.homerentalsystem.dto.response.StatisticsResponse;

public interface OwnerService {
    void verifyOwner(VerifyOwnerRequest request);

    StatisticsResponse getStatistics();
}
