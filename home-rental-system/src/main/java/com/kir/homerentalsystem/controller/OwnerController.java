package com.kir.homerentalsystem.controller;

import com.kir.homerentalsystem.dto.ApiResponse;
import com.kir.homerentalsystem.dto.request.VerifyOwnerRequest;
import com.kir.homerentalsystem.dto.response.StatisticsResponse;
import com.kir.homerentalsystem.service.OwnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/owner")
public class OwnerController {
    private final OwnerService ownerService;

    @PutMapping("/admin/verifyOwner")
    public ApiResponse<Void> verifyOwner(@RequestBody VerifyOwnerRequest request) {
        ownerService.verifyOwner(request);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/owner/getStatistics")
    public ApiResponse<StatisticsResponse> getStatistics(){
        return ApiResponse.<StatisticsResponse>builder()
                .result(ownerService.getStatistics())
                .build();
    }
}
