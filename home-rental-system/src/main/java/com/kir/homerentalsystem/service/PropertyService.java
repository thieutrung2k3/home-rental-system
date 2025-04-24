package com.kir.homerentalsystem.service;

import com.cloudinary.Search;
import com.kir.homerentalsystem.dto.request.AmenityRequest;
import com.kir.homerentalsystem.dto.request.PropertyCreationRequest;
import com.kir.homerentalsystem.dto.request.PropertyImageRequest;
import com.kir.homerentalsystem.dto.response.PropertyResponse;
import com.kir.homerentalsystem.entity.*;
import jakarta.mail.Multipart;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.parameters.P;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public interface PropertyService {
    PropertyResponse createProperty(PropertyCreationRequest request);

    void deleteProperty(long propertyId);

    void updateProperty(PropertyCreationRequest request);

    Page<PropertyResponse> getAllMyProperties(int page, int size, String sortBy);

    Page<PropertyResponse> getAllProperties(int page, int size, String sortBy);

    Page<PropertyResponse> searchProperties(String keyword, int page, int size, String sortBy);

    Page<PropertyResponse> getPropertiesByCategory(long categoryId, int page, int size, String sortBy);

    Page<PropertyResponse> getPropertiesByEmail(long ownerId, int page, int size, String sortBy);

    Set<PropertyImage> processPropertyImages(List<PropertyImageRequest> imageRequests, Property property);

    Property createPropertyEntity(PropertyCreationRequest request, Owner owner, PropertyCategory category, Location location);

    PropertyResponse getPropertyById(Long id);

    void validateOwnerStatus(Owner owner);

    Set<Amenity> processAmenities(List<AmenityRequest> amenityRequests, Property property);

    Location processLocation(Location location);

    Specification<Property> getSearchPropertiesForOwner(String title, String address, Integer bedrooms, Integer bathrooms,
                                                        BigDecimal minArea, BigDecimal maxArea,
                                                        BigDecimal minPrice, BigDecimal maxPrice, Boolean isAvailable);

    Page<PropertyResponse> searchPropertiesForOwner(String title, String address, Integer bedrooms, Integer bathrooms,
                                            BigDecimal minArea, BigDecimal maxArea,
                                            BigDecimal minPrice, BigDecimal maxPrice, Boolean isAvailable,
                                            Pageable pageable);
}
