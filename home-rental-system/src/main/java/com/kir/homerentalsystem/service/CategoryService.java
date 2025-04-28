package com.kir.homerentalsystem.service;

import com.kir.homerentalsystem.dto.response.CategoryResponse;
import jdk.jfr.Category;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> findAll();
}
