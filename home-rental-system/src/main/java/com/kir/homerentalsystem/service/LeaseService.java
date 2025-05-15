package com.kir.homerentalsystem.service;

import com.kir.homerentalsystem.constant.LeaseStatus;
import com.kir.homerentalsystem.dto.request.LeaseCreationRequest;
import com.kir.homerentalsystem.dto.response.ExportFileResponse;
import com.kir.homerentalsystem.dto.response.LeaseResponse;

import java.time.LocalDate;
import java.util.List;

public interface LeaseService {
    void startLease(LeaseCreationRequest request);

    boolean canBePrebooked(Long propertyId, LocalDate startDate);

    LeaseResponse createPrebookedLease(LeaseCreationRequest request);

    void activePrebookedLease();

    LeaseResponse createLease(LeaseCreationRequest request);

    void updateLeaseStatus(Long leaseId, LeaseStatus status);

    List<LeaseResponse> getLeasesByStatusAndOwner(Long ownerId, LeaseStatus status);

    ExportFileResponse exportLease(Long leaseId);
}
