package com.kir.homerentalsystem.service;

import com.kir.homerentalsystem.dto.request.LeaseCreationRequest;
import com.kir.homerentalsystem.dto.response.LeaseResponse;

import java.time.LocalDate;

public interface LeaseService {
    void startLease(LeaseCreationRequest request);
    boolean canBePrebooked(Long propertyId, LocalDate startDate);
    LeaseResponse createPrebookedLease(LeaseCreationRequest request);
}
