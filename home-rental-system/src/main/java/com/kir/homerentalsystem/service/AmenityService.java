package com.kir.homerentalsystem.service;

import com.kir.homerentalsystem.dto.response.AmenityResponse;

import java.util.List;

public interface AmenityService {
    List<AmenityResponse> getAll();
}
