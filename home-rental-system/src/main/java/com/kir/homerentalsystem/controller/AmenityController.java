package com.kir.homerentalsystem.controller;

import com.kir.homerentalsystem.dto.ApiResponse;
import com.kir.homerentalsystem.dto.response.AmenityResponse;
import com.kir.homerentalsystem.service.AmenityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/amenity")
public class AmenityController {
    private final AmenityService amenityService;

    @GetMapping("/public/getAll")
    public ApiResponse<List<AmenityResponse>> getAll(){
        return ApiResponse.<List<AmenityResponse>>builder()
                .result(amenityService.getAll())
                .build();
    }
}
