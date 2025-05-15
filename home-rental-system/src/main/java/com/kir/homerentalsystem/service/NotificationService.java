package com.kir.homerentalsystem.service;

import com.kir.homerentalsystem.dto.response.NotificationResponse;
import org.springframework.data.domain.Page;

public interface NotificationService {
    Page<NotificationResponse> getAllNotifications(int page, int size);
}
