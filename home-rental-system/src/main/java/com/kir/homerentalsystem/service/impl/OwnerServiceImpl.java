package com.kir.homerentalsystem.service.impl;

import com.kir.homerentalsystem.constant.VerificationStatus;
import com.kir.homerentalsystem.dto.request.VerifyOwnerRequest;
import com.kir.homerentalsystem.entity.Owner;
import com.kir.homerentalsystem.exception.AppException;
import com.kir.homerentalsystem.exception.ErrorCode;
import com.kir.homerentalsystem.repository.OwnerRepository;
import com.kir.homerentalsystem.service.OwnerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.EnumUtils;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OwnerServiceImpl implements OwnerService {
    private final OwnerRepository ownerRepository;

    @Override
    public void verifyOwner(VerifyOwnerRequest request) {
        String status = request.getStatus().toUpperCase();
        log.info("Verifying owner with status: {}", status);
        if(!EnumUtils.isValidEnum(VerificationStatus.class, status)){
            throw new AppException(ErrorCode.VERIFICATION_NOT_EXISTED);
        }
        Owner owner = ownerRepository.findByAccount_AccountId(request.getAccountId())
                .orElseThrow(() -> new AppException(ErrorCode.OWNER_NOT_EXISTED));

        owner.setVerificationStatus(status);
        ownerRepository.save(owner);
    }
}
