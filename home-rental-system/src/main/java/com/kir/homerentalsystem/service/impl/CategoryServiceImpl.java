package com.kir.homerentalsystem.service.impl;

import com.kir.homerentalsystem.dto.response.CategoryResponse;
import com.kir.homerentalsystem.dto.response.PropertyAttributeResponse;
import com.kir.homerentalsystem.entity.CategoryAttribute;
import com.kir.homerentalsystem.entity.PropertyCategory;
import com.kir.homerentalsystem.repository.CategoryAttributeRepository;
import com.kir.homerentalsystem.repository.PropertyCategoryRepository;
import com.kir.homerentalsystem.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final PropertyCategoryRepository propertyCategoryRepository;
    private final CategoryAttributeRepository categoryAttributeRepository;

    @Override
    public List<CategoryResponse> findAll() {
        List<PropertyCategory> propertyCategories = propertyCategoryRepository.findAll();
        List<CategoryResponse> categoryResponses = new ArrayList<>();

        for (PropertyCategory propertyCategory : propertyCategories) {
            List<PropertyAttributeResponse> propertyAttributeResponses = new ArrayList<>();
            List<CategoryAttribute> categoryAttributes = categoryAttributeRepository.findAllByCategory_CategoryId(propertyCategory.getCategoryId());

            categoryAttributes.forEach(ca -> {
                propertyAttributeResponses.add(PropertyAttributeResponse.builder()
                        .id(ca.getAttribute().getId())
                        .name(ca.getAttribute().getName())
                        .dataType(ca.getAttribute().getDataType())
                        .description(ca.getAttribute().getDescription())
                        .unit(ca.getAttribute().getUnit())
                        .build());
            });
            categoryResponses.add(CategoryResponse.builder()
                    .categoryId(propertyCategory.getCategoryId())
                    .name(propertyCategory.getName())
                    .description(propertyCategory.getDescription())
                    .propertyAttributes(propertyAttributeResponses)
                    .build());
        }

        return categoryResponses;
    }
}

