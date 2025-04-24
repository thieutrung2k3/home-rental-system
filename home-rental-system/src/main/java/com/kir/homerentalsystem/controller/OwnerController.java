package com.kir.homerentalsystem.controller;

import com.kir.homerentalsystem.dto.ApiResponse;
import com.kir.homerentalsystem.dto.request.VerifyOwnerRequest;
import com.kir.homerentalsystem.service.OwnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
