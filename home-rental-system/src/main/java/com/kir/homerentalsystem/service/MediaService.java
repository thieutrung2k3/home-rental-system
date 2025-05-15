package com.kir.homerentalsystem.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MediaService {
    List<String> uploadImages(MultipartFile[] file);

    String uploadImage(MultipartFile file);
}
