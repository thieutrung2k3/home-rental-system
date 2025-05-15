package com.kir.homerentalsystem.service.impl;

import com.kir.homerentalsystem.dto.response.NotificationResponse;
import com.kir.homerentalsystem.entity.Notification;
import com.kir.homerentalsystem.mapper.NotificationMapper;
import com.kir.homerentalsystem.repository.NotificationRepository;
import com.kir.homerentalsystem.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public Page<NotificationResponse> getAllNotifications(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("ASC", "createdAt"));

        Page<Notification> notifications = notificationRepository.findAll(pageable);

        return notifications.map(notificationMapper::toNotificationResponse);
    }
}
