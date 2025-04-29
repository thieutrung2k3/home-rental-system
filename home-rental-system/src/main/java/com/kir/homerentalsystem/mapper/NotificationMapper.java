package com.kir.homerentalsystem.mapper;

import com.kir.homerentalsystem.dto.response.NotificationResponse;
import com.kir.homerentalsystem.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponse toNotificationResponse(Notification notification);
}
