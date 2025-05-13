package com.kir.homerentalsystem.controller;

import com.kir.homerentalsystem.constant.AuthEmailType;
import com.kir.homerentalsystem.dto.ApiResponse;
import com.kir.homerentalsystem.dto.request.LoginRequest;
import com.kir.homerentalsystem.dto.response.AccountResponse;
import com.kir.homerentalsystem.dto.response.LoginResponse;
import com.kir.homerentalsystem.service.AccountService;
import com.kir.homerentalsystem.service.AuthService;
import com.kir.homerentalsystem.service.kafka.producer.EmailProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final EmailProducer emailProducer;
    private final AccountService accountService;

    @GetMapping("/public/test")
    public ApiResponse<String> test(@RequestBody String num) {
       return ApiResponse.<String>builder()
                .result(authService.test(num))
                .build();
    }

    @PostMapping("/public/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        return ApiResponse.<LoginResponse>builder()
                .result(authService.login(request))
                .build();
    }

    @PostMapping("/public/validateOtpCode")
    public ApiResponse<AccountResponse> validateOtpCode(
            @RequestParam("email") String email,
            @RequestParam("otpCode") String otpCode,
            @RequestParam("type") String type
    ) {
        return ApiResponse.<AccountResponse>builder()
                .result(authService.validateOtpCode(email, otpCode, AuthEmailType.valueOf(type.toUpperCase())))
                .build();
    }

    @PostMapping("/public/confirmPasswordReset")
    public ApiResponse<Void> confirmPasswordReset(
            @RequestParam("email") String email,
            @RequestParam("code") String code) {
        authService.confirmPasswordReset(email, code);
        return ApiResponse.<Void>builder().build();
    }
}
