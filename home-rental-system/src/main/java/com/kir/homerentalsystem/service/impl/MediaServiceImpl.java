package com.kir.homerentalsystem.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.kir.homerentalsystem.exception.AppException;
import com.kir.homerentalsystem.exception.ErrorCode;
import com.kir.homerentalsystem.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {
    private final Cloudinary cloudinary;

    @Override
    public List<String> uploadImages(MultipartFile[] files) {
        List<String> urls = new ArrayList<>();
        try {
            for (var file : files) {
                Map uploadResults = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                urls.add(uploadResults.get("url").toString());
            }
        } catch (Exception e) {
            throw new AppException(ErrorCode.CAN_NOT_SAVE_FILE);
        }
        return urls;
    }

    @Override
    public String uploadImage(MultipartFile file) {
        try{
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
            return uploadResult.get("url").toString();
        } catch (Exception e) {
            throw new AppException(ErrorCode.CAN_NOT_SAVE_FILE);
        }
    }
}
