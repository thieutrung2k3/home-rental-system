package com.kir.homerentalsystem.mapper;

import com.kir.homerentalsystem.dto.request.AccountCreationRequest;
import com.kir.homerentalsystem.dto.response.AccountResponse;
import com.kir.homerentalsystem.entity.Account;
import com.kir.homerentalsystem.entity.Owner;
import com.kir.homerentalsystem.entity.Tenant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AccountMapper {
    Account toAccount(AccountCreationRequest request);

    @Mapping(target = "roleName", source = "role.name")
    AccountResponse toAccountResponse(Account account);

    @Mapping(target = "companyName", source = "owner.companyName")
    @Mapping(target = "taxId", source = "owner.taxId")
    AccountResponse toAccountResponseFromOwner(Account account, Owner owner);

    @Mapping(target = "dateOfBirth", source = "tenant.dateOfBirth")
    @Mapping(target = "occupation", source = "tenant.occupation")
    @Mapping(target = "income", source = "tenant.income")
    AccountResponse toAccountResponseFromTenant(Account account, Tenant tenant);
}
