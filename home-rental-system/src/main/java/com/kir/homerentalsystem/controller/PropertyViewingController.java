package com.kir.homerentalsystem.controller;

import com.kir.homerentalsystem.dto.ApiResponse;
import com.kir.homerentalsystem.dto.request.PropertyViewingRequest;
import com.kir.homerentalsystem.dto.response.NotificationResponse;
import com.kir.homerentalsystem.dto.response.PropertyResponse;
import com.kir.homerentalsystem.dto.response.PropertyViewingResponse;
import com.kir.homerentalsystem.service.PropertyViewingService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/propertyViewing")
public class PropertyViewingController {
    private final PropertyViewingService propertyViewingService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @PostMapping("/tenant/create")
    public ApiResponse<PropertyViewingResponse> createPropertyViewing(@RequestBody PropertyViewingRequest request) {
        return ApiResponse.<PropertyViewingResponse>builder()
                .result(propertyViewingService.createPropertyViewing(request))
                .build();
    }

    @MessageMapping("/public/notifications")
    public void sendNotifications(@RequestBody NotificationResponse response) {
        System.out.println("Received property response: " + response);
        simpMessagingTemplate.convertAndSendToUser(
                "t.hieutrung2k3@gmail.com",
                "/queue/notifications",
                response

        );
    }
}
