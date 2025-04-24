package com.kir.homerentalsystem.service.impl;

import com.kir.homerentalsystem.constant.VerificationStatus;
import com.kir.homerentalsystem.dto.request.AmenityRequest;
import com.kir.homerentalsystem.dto.request.PropertyCreationRequest;
import com.kir.homerentalsystem.dto.request.PropertyImageRequest;
import com.kir.homerentalsystem.dto.response.PropertyResponse;
import com.kir.homerentalsystem.entity.*;
import com.kir.homerentalsystem.exception.AppException;
import com.kir.homerentalsystem.exception.ErrorCode;
import com.kir.homerentalsystem.mapper.AmenityMapper;
import com.kir.homerentalsystem.mapper.PropertyMapper;
import com.kir.homerentalsystem.repository.*;
import com.kir.homerentalsystem.service.MediaService;
import com.kir.homerentalsystem.service.PropertyService;
import com.kir.homerentalsystem.util.AuthUtil;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PropertyServiceImpl implements PropertyService {
    private final LocationRepository locationRepository;
    private final OwnerRepository ownerRepository;
    private final PropertyCategoryRepository propertyCategoryRepository;
    private final PropertyRepository propertyRepository;
    private final AmenityRepository amenityRepository;
    private final PropertyMapper propertyMapper;
    private final PropertyImageRepository propertyImageRepository;
    private final AccountRepository accountRepository;
    private final MediaService mediaService;
    private final AmenityMapper amenityMapper;

    @Override
    public Specification<Property> getSearchPropertiesForOwner(String title, String address,
                                                           Integer bedrooms, Integer bathrooms,
                                                           BigDecimal minArea, BigDecimal maxArea,
                                                           BigDecimal minPrice, BigDecimal maxPrice,
                                                           Boolean isAvailable) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Tìm kiếm theo tiêu đề
            if (title != null && !title.isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        "%" + title.toLowerCase() + "%"
                ));
            }

            if(address != null && !address.isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("address")),
                        "%" + address.toLowerCase() + "%"
                ));
            }

            if(bedrooms != null) {
                predicates.add(criteriaBuilder.equal(root.get("bedrooms"), bedrooms));
            }

            if(bathrooms != null) {
                predicates.add(criteriaBuilder.equal(root.get("bathrooms"), bathrooms));
            }

            if(minArea != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("area"), minArea));
            }

            if(maxArea != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("area"), maxArea));
            }

            if(minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("pricePerMonth"), minPrice));
            }
            if(maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("pricePerMonth"), maxPrice));
            }

            if(isAvailable != null) {
                predicates.add(criteriaBuilder.equal(root.get("isAvailable"), isAvailable));
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    public Page<PropertyResponse> searchPropertiesForOwner(
            String title,
            String address,
            Integer bedrooms,
            Integer bathrooms,
            BigDecimal minArea,
            BigDecimal maxArea,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean isAvailable,
            Pageable pageable
    ) {
        Page<Property> properties = propertyRepository.findAll(
                getSearchPropertiesForOwner(title, address, bedrooms, bathrooms,
                        minArea, maxArea, minPrice, maxPrice, isAvailable),
                pageable
        );
        return properties.map(propertyMapper::toPropertyResponse);
    }


    @Override
    public void deleteProperty(long propertyId) {
        String email = AuthUtil.getEmailFromToken();

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_EXISTED));

        if (property.getOwner().getAccount().getEmail().equals(email)) {
            throw new AppException(ErrorCode.NOT_AUTHORIZED);
        }

        propertyRepository.deleteById(propertyId);
        log.info("Property deleted: {}", property);
    }

    @Override
    public void updateProperty(PropertyCreationRequest request) {

    }

    @Override
    public Page<PropertyResponse> getAllProperties(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<Property> properties = propertyRepository.findAll(pageable);
        if (properties.isEmpty()) {
            throw new AppException(ErrorCode.PROPERTY_NOT_EXISTED);
        }
        return properties.map(propertyMapper::toPropertyResponse);
    }

    @Override
    public Page<PropertyResponse> searchProperties(String keyword, int page, int size, String sortBy) {
        return null;
    }

    @Override
    public Page<PropertyResponse> getPropertiesByCategory(long categoryId, int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<Property> properties = propertyRepository.findAllByCategory_CategoryId(pageable, categoryId);
        if (properties.isEmpty()) {
            throw new AppException(ErrorCode.PROPERTY_NOT_EXISTED);
        }
        return properties.map(propertyMapper::toPropertyResponse);
    }

    @Override
    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_EXISTED));

        return propertyMapper.toPropertyResponse(property);
    }

    @Override
    public Page<PropertyResponse> getPropertiesByEmail(long ownerId, int page, int size, String sortBy) {
        String email = AuthUtil.getEmailFromToken();

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<Property> properties = propertyRepository.findAllByOwner_Account_Email(pageable, email);
        if (properties.isEmpty()) {
            throw new AppException(ErrorCode.PROPERTY_NOT_EXISTED);
        }
        return properties.map(propertyMapper::toPropertyResponse);
    }

    @Override
    public Page<PropertyResponse> getAllMyProperties(int page, int size, String sortBy) {
        String email = AuthUtil.getEmailFromToken();

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<Property> properties = propertyRepository.findAllByOwner_Account_Email(pageable, email);
        if (properties.isEmpty()) {
            throw new AppException(ErrorCode.PROPERTY_NOT_EXISTED);
        }

        return properties.map(propertyMapper::toPropertyResponse);
    }

    @Transactional
    @Override
    public PropertyResponse createProperty(PropertyCreationRequest request) {
        // Lấy và xác thực chủ sở hữu
        String email = AuthUtil.getEmailFromToken();
        Owner owner = ownerRepository.findByAccount_Email(email)
                .orElseThrow(() -> new AppException(ErrorCode.OWNER_NOT_EXISTED));

        validateOwnerStatus(owner);
        log.info("Creating property for owner: {}", owner.getOwnerId());

        // Lấy và xác thực danh mục bất động sản
        PropertyCategory category = propertyCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_CATEGORY_NOT_EXISTED));
        log.info("Creating property with category: {}", category.getCategoryId());

        // Xử lý vị trí
        Location location = processLocation(request.getLocation());
        log.info("Creating property with location: {}", location.getLocationId());

        // Tạo đối tượng Property
        Property property = createPropertyEntity(request, owner, category, location);

        // Xử lý tiện nghi
        Set<Amenity> amenities = processAmenities(request.getAmenities(), property);

        // Xử lý hình ảnh
        Set<PropertyImage> propertyImages = processPropertyImages(request.getPropertyImages(), property);

        // Lưu tất cả dữ liệu
        property.setAmenities(amenities);
        property.setPropertyImages(propertyImages);
        property = propertyRepository.save(property);
        log.info("Property created with ID: {}", property.getPropertyId());

        if (!propertyImages.isEmpty()) {
            propertyImageRepository.saveAll(propertyImages);
        }

        if (!amenities.isEmpty()) {
            amenityRepository.saveAll(amenities);
        }

        return propertyMapper.toPropertyResponse(property);
    }

    @Override
    public void validateOwnerStatus(Owner owner) {
        if (VerificationStatus.PENDING.name().equals(owner.getVerificationStatus()) ||
                VerificationStatus.REJECTED.name().equals(owner.getVerificationStatus())) {
            throw new AppException(ErrorCode.NOT_AUTHORIZED);
        }
    }

    @Override
    public Location processLocation(Location location) {
        if (location == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (location.getLocationId() != null) {
            return locationRepository.findById(location.getLocationId())
                    .orElseGet(() -> locationRepository.save(location));
        }

        return locationRepository.save(location);
    }

    @Override
    public Property createPropertyEntity(PropertyCreationRequest request, Owner owner,
                                         PropertyCategory category, Location location) {
        Property property = propertyMapper.toProperty(request);
        property.setLocation(location);
        property.setOwner(owner);
        property.setCategory(category);
        property.setAddress(String.format("%s, %s, %s, %s",
                location.getWard(), location.getDistrict(),
                location.getCity(), location.getCountry()));
        property.setIsAvailable(true);
        property.setIsFeatured(false);

        return property;
    }

    @Override
    public Set<Amenity> processAmenities(List<AmenityRequest> amenityRequests, Property property) {
        if (amenityRequests == null || amenityRequests.isEmpty()) {
            return new HashSet<>();
        }

        Set<Amenity> amenities = new HashSet<>();
        for (AmenityRequest request : amenityRequests) {
            if (request.getFile() == null) {
                continue;
            }
            String url = mediaService.uploadImage(request.getFile());
            Amenity amenity = amenityMapper.toAmenity(request);
            amenity.setProperty(property);
            amenity.setImageUrl(url);
            amenities.add(amenity);
        }

        return amenities;
    }

    @Override
    public Set<PropertyImage> processPropertyImages(List<PropertyImageRequest> imageRequests, Property property) {
        if (imageRequests == null || imageRequests.isEmpty()) {
            return new HashSet<>();
        }

        Set<PropertyImage> propertyImages = new HashSet<>();
        for (PropertyImageRequest request : imageRequests) {
            if (request.getFile() == null) {
                continue;
            }

            String url = mediaService.uploadImage(request.getFile());
            PropertyImage propertyImage = PropertyImage.builder()
                    .imageUrl(url)
                    .isPrimary(request.getIsPrimary())
                    .property(property)
                    .build();
            propertyImages.add(propertyImage);
        }

        return propertyImages;
    }
}
