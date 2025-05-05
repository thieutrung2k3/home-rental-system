package com.kir.homerentalsystem.controller;

import com.cloudinary.Api;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kir.homerentalsystem.dto.ApiResponse;
import com.kir.homerentalsystem.dto.request.PropertyCreationRequest;
import com.kir.homerentalsystem.dto.response.PropertyResponse;
import com.kir.homerentalsystem.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/property")
public class PropertyController {
    private final PropertyService propertyService;

    @PostMapping(value = "/owner/createProperty", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<PropertyResponse> createProperty(
            @RequestParam("property") String propertyJson,
            @RequestParam("propertyImages") List<MultipartFile> propertyImages) throws JsonProcessingException {

        ObjectMapper objectMapper = new ObjectMapper();
        PropertyCreationRequest request = objectMapper.readValue(propertyJson, PropertyCreationRequest.class);

        // Đảm bảo danh sách không null và kích thước phù hợp
        if (request.getPropertyImages() != null && propertyImages != null &&
                request.getPropertyImages().size() == propertyImages.size()) {
            for (int i = 0; i < propertyImages.size(); i++) {
                request.getPropertyImages().get(i).setFile(propertyImages.get(i));
            }
        }

        return ApiResponse.<PropertyResponse>builder()
                .result(propertyService.createProperty(request))
                .build();
    }

    @GetMapping("/owner/getAllMyProperties")
    public ApiResponse<Page<PropertyResponse>> getAllMyProperties(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("sortBy") String sortBy
    ) {
        return ApiResponse.<Page<PropertyResponse>>builder()
                .result(propertyService.getAllMyProperties(page, size, sortBy))
                .build();
    }

    @DeleteMapping("/owner/deleteProperty")
    public ApiResponse<Void> deleteProperty(@RequestParam(value = "id") Long id) {
        propertyService.deleteProperty(id);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/public/getPropertyById")
    public ApiResponse<PropertyResponse> getPropertyById(@RequestParam(value = "id") Long id) {
        return ApiResponse.<PropertyResponse>builder()
                .result(propertyService.getPropertyById(id))
                .build();
    }

    @GetMapping("/owner/searchProperties")
    public ApiResponse<Page<PropertyResponse>> searchPropertiesForOwner(@RequestParam(value = "title", required = false) String title,
                                                                        @RequestParam(value = "address", required = false) String address,
                                                                        @RequestParam(value = "bedrooms", required = false) Integer bedrooms,
                                                                        @RequestParam(value = "bathrooms", required = false) Integer bathrooms,
                                                                        @RequestParam(value = "minArea", required = false) BigDecimal minArea,
                                                                        @RequestParam(value = "maxArea", required = false) BigDecimal maxArea,
                                                                        @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
                                                                        @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
                                                                        @RequestParam(value = "isAvailable", required = false) Boolean isAvailable,
                                                                        @RequestParam(value = "page", defaultValue = "0") int page,
                                                                        @RequestParam(value = "size", defaultValue = "10") int size,
                                                                        @RequestParam(value = "sortBy", defaultValue = "propertyId") String sortBy,
                                                                        @RequestParam(value = "sortDirection", defaultValue = "ASC") String sortDirection){
        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ?
                Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return ApiResponse.<Page<PropertyResponse>>builder()
                .result(propertyService.searchPropertiesForOwner(title, address,
                        bedrooms, bathrooms,
                        minArea, maxArea,
                        minPrice, maxPrice,
                        isAvailable, pageable))
                .build();
    }
}
