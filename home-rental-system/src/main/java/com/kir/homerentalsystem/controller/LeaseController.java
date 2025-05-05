package com.kir.homerentalsystem.controller;

import com.cloudinary.Api;
import com.kir.homerentalsystem.constant.LeaseStatus;
import com.kir.homerentalsystem.dto.ApiResponse;
import com.kir.homerentalsystem.dto.request.LeaseCreationRequest;
import com.kir.homerentalsystem.dto.response.LeaseResponse;
import com.kir.homerentalsystem.service.LeaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lease")
@RequiredArgsConstructor
public class LeaseController {
    private final LeaseService leaseService;

    @PostMapping("/tenant/createPrebookedLease")
    public ApiResponse<LeaseResponse> createPrebookedLease(@RequestBody LeaseCreationRequest request) {
        return ApiResponse.<LeaseResponse>builder()
                .result(leaseService.createPrebookedLease(request))
                .build();
    }

    @PostMapping("/tenant/createLease")
    public ApiResponse<LeaseResponse> creatLease(@RequestBody LeaseCreationRequest request){
        return ApiResponse.<LeaseResponse>builder()
                .result(leaseService.createLease(request))
                .build();
    }

    @PutMapping("/owner/updateLeaseStatus")
    public ApiResponse<Void> updateLeaseStatus(@RequestParam Long leaseId, @RequestParam String status) {
        leaseService.updateLeaseStatus(leaseId, LeaseStatus.valueOf(status.toUpperCase()));
        return ApiResponse.<Void>builder()
                .build();
    }

    @GetMapping("/user/getLeasesByStatusAndOwner")
    public ApiResponse<List<LeaseResponse>> getLeasesByStatusAndOwner(@RequestParam LeaseStatus status, @RequestParam Long ownerId) {
        return ApiResponse.<List<LeaseResponse>>builder()
                .result(leaseService.getLeasesByStatusAndOwner(ownerId, status))
                .build();
    }
}
