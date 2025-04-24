package com.kir.homerentalsystem.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.kir.homerentalsystem.constant.AuthEmailType;
import com.kir.homerentalsystem.dto.ApiResponse;
import com.kir.homerentalsystem.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
public class EmailController {
    private final EmailService emailService;

    @PostMapping("/public/sendOtpEmail")
    public ApiResponse<Void> sendOtpEmail(
            @RequestParam("email") String email
    ) {
        emailService.sendEmailForAuth(email, AuthEmailType.REGISTER);
        return ApiResponse.<Void>builder()
                .build();
    }
}
