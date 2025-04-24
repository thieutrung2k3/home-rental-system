package com.kir.homerentalsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long notificationId;
    private String title;
    private String message;
    private Boolean isRead;
    private Long accountId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
