package com.kir.homerentalsystem.service;

import com.kir.homerentalsystem.constant.AuthEmailType;
import com.kir.homerentalsystem.dto.request.*;
import com.kir.homerentalsystem.dto.response.AccountResponse;
import com.kir.homerentalsystem.dto.response.AuthenticationResponse;
import com.kir.homerentalsystem.dto.response.LoginResponse;
import com.kir.homerentalsystem.dto.response.ValidateTokenResponse;
import com.kir.homerentalsystem.entity.Account;
import com.nimbusds.jwt.SignedJWT;

import java.text.ParseException;

public interface AuthService {
    LoginResponse login(LoginRequest request);

    String generateToken(Account account);

    void logout(LogoutRequest request) throws ParseException;

    ValidateTokenResponse validateToken(ValidateTokenRequest request);

    SignedJWT verifyToken(String token, boolean flag);

    AccountResponse validateOtpCode(String email, String otpCode, AuthEmailType type);

    void confirmPasswordReset(String email, String code);

    //TEST
    void test();
}
