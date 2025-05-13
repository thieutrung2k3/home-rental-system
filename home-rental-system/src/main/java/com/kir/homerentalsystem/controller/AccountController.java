package com.kir.homerentalsystem.controller;

import com.kir.homerentalsystem.constant.AccountStatus;
import com.kir.homerentalsystem.dto.ApiResponse;
import com.kir.homerentalsystem.dto.request.AccountCreationRequest;
import com.kir.homerentalsystem.dto.request.AccountUpdateRequest;
import com.kir.homerentalsystem.dto.request.PasswordUpdateRequest;
import com.kir.homerentalsystem.dto.response.AccountResponse;
import com.kir.homerentalsystem.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/account")
public class AccountController {
    private final AccountService accountService;


    @PostMapping("/public/register")
    public ApiResponse<AccountResponse> register(@RequestBody AccountCreationRequest request) {
        return ApiResponse.<AccountResponse>builder()
                .result(accountService.register(request))
                .build();
    }

    @GetMapping("/user/getMyInfo")
    public ApiResponse<AccountResponse> getMyInfo() {
        log.info("Get my info");
        return ApiResponse.<AccountResponse>builder()
                .result(accountService.getMyInfo())
                .build();
    }

    @GetMapping("/getAccountById")
    public ApiResponse<AccountResponse> getAccountById(@RequestParam(value = "id") Long id) {
        return ApiResponse.<AccountResponse>builder()
                .result(accountService.getAccountById(id))
                .build();
    }

    @PostMapping("/public/sendResetPasswordEmail")
    public ApiResponse<Void> sendResetPasswordEmail(
            @RequestParam("email") String email
    ) {
        accountService.resetPassword(email);
        return ApiResponse.<Void>builder()
                .build();
    }

    @PutMapping("/user/updatePassword")
    public ApiResponse<Void> updatePassword(@RequestBody PasswordUpdateRequest request) {
        accountService.updatePassword(request);
        return ApiResponse.<Void>builder().build();
    }


    @GetMapping("/admin/getAllAccountsByRolesAndStatus")
    public ApiResponse<Page<AccountResponse>> getAllAccountsByRolesAndStatus(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "accountId") String sortBy,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "roleNames") List<String> roleNames

    ){
        return ApiResponse.<Page<AccountResponse>>builder()
                .result(accountService.getAllAccountsByRolesAndStatus(page, size, sortBy, roleNames, status))
                .build();
    }

    @DeleteMapping("/admin/deleteAccount")
    public ApiResponse<Void> deleteAccount(@RequestParam(value = "id") Long id) {
        accountService.deleteAccount(id);
        return ApiResponse.<Void>builder().build();
    }

    @DeleteMapping("/user/deleteMyAccount")
    public ApiResponse<Void> deleteMyAccount() {
        accountService.deleteMyAccount();
        return ApiResponse.<Void>builder().build();
    }

    @PutMapping("/user/updateMyInfo")
    public ApiResponse<AccountResponse> updateMyInfo(@RequestBody AccountUpdateRequest request) {
        return ApiResponse.<AccountResponse>builder()
                .result(accountService.updateMyInfo(request))
                .build();
    }

    @PutMapping("/admin/bulkUpdateAccountStatus")
    public ApiResponse<String> bulkUpdateAccountStatus(@RequestParam("ids") List<Long> ids,
                                                       @RequestParam("status") String status) {
        return ApiResponse.<String>builder()
                .result(accountService.bulkUpdateAccountStatus(ids, status))
                .build();
    }
}
