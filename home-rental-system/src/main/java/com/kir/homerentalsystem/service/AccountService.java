package com.kir.homerentalsystem.service;

import com.kir.homerentalsystem.dto.request.AccountCreationRequest;
import com.kir.homerentalsystem.dto.request.AccountUpdateRequest;
import com.kir.homerentalsystem.dto.request.PasswordUpdateRequest;
import com.kir.homerentalsystem.dto.response.AccountResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface AccountService {
    AccountResponse register(AccountCreationRequest request);

    void updatePassword(PasswordUpdateRequest request);

    AccountResponse getMyInfo();

    AccountResponse getAccountById(Long id);

    List<AccountResponse> searchAccounts(String keyword);

    void resetPassword(String email);

    AccountResponse updateMyInfo(AccountUpdateRequest request);

    void deleteMyAccount(); // WAITING

    //Admin
    Page<AccountResponse> getAllAccountsByRolesAndStatus(int page, int size, String sortBy, List<String> roleNames, String status);

    String bulkUpdateAccountStatus(List<Long> ids, String status);

    void deleteAccount(Long id);

}
