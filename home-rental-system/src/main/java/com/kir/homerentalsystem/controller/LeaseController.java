package com.kir.homerentalsystem.controller;

import com.kir.homerentalsystem.dto.ApiResponse;
import com.kir.homerentalsystem.dto.request.LeaseCreationRequest;
import com.kir.homerentalsystem.dto.response.LeaseResponse;
import com.kir.homerentalsystem.service.LeaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
