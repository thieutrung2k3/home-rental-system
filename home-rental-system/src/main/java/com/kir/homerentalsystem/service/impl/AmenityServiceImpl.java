package com.kir.homerentalsystem.service.impl;

import com.kir.homerentalsystem.dto.response.AmenityResponse;
import com.kir.homerentalsystem.mapper.AmenityMapper;
import com.kir.homerentalsystem.repository.AmenityRepository;
import com.kir.homerentalsystem.service.AmenityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AmenityServiceImpl implements AmenityService {
    private final AmenityRepository amenityRepository;
    private final AmenityMapper amenityMapper;

    @Override
    public List<AmenityResponse> getAll() {
        List<AmenityResponse> amenityResponses = amenityRepository.findAll()
                .stream().map(amenityMapper::toAmenityResponse).toList();
        return amenityResponses.isEmpty() ? new ArrayList<>() : amenityResponses;
    }
}
