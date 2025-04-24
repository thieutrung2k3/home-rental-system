package com.kir.homerentalsystem.service;

import com.kir.homerentalsystem.dto.request.PropertyViewingRequest;
import com.kir.homerentalsystem.dto.response.PropertyResponse;
import com.kir.homerentalsystem.dto.response.PropertyViewingResponse;

public interface PropertyViewingService {
    PropertyViewingResponse createPropertyViewing(PropertyViewingRequest request);
}
