package com.kir.homerentalsystem.service.impl;

import com.kir.homerentalsystem.constant.NotificationTitle;
import com.kir.homerentalsystem.constant.NotificationType;
import com.kir.homerentalsystem.constant.PropertyViewingStatus;
import com.kir.homerentalsystem.dto.request.PropertyViewingRequest;
import com.kir.homerentalsystem.dto.response.NotificationResponse;
import com.kir.homerentalsystem.dto.response.PropertyViewingResponse;
import com.kir.homerentalsystem.entity.*;
import com.kir.homerentalsystem.exception.AppException;
import com.kir.homerentalsystem.exception.ErrorCode;
import com.kir.homerentalsystem.mapper.NotificationMapper;
import com.kir.homerentalsystem.mapper.PropertyViewingMapper;
import com.kir.homerentalsystem.repository.*;
import com.kir.homerentalsystem.service.PropertyViewingService;
import com.kir.homerentalsystem.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PropertyViewingServiceImpl implements PropertyViewingService {
    private final PropertyViewingRepository propertyViewingRepository;
    private final TenantRepository tenantRepository;
    private final PropertyRepository propertyRepository;
    private final AccountRepository accountRepository;
    private final NotificationRepository notificationRepository;

    private final PropertyViewingMapper propertyViewingMapper;
    private final NotificationMapper notificationMapper;

    private final SimpMessagingTemplate messagingTemplate;


    @Transactional
    @Override
    public PropertyViewingResponse createPropertyViewing(PropertyViewingRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_EXISTED));

        if (!property.getIsAvailable()) {
            throw new AppException(ErrorCode.PROPERTY_IS_NOT_AVAILABLE);
        }

        String email = AuthUtil.getEmailFromToken();

        Tenant tenant = tenantRepository.findByAccount_Email(email)
                .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_EXISTED));

        if(propertyViewingRepository
                .existsByProperty_PropertyIdAndTenant_TenantIdAndStatusIn(property.getPropertyId(), tenant.getTenantId(), List.of(PropertyViewingStatus.REQUESTED.name(), PropertyViewingStatus.CONFIRMED.name()))){
            throw new AppException(ErrorCode.PROPERTY_VIEWING_REQUEST_EXISTED);
        }

        PropertyViewing propertyViewing = propertyViewingMapper.toPropertyViewing(request);
        log.info("Creating property viewing: {}", propertyViewing);
        propertyViewing.setProperty(property);
        propertyViewing.setTenant(tenant);
        propertyViewing.setStatus(PropertyViewingStatus.REQUESTED.name());

        propertyViewingRepository.save(propertyViewing);

        Owner owner = property.getOwner();
        if (owner != null) {
            Account account = owner.getAccount();
            Notification notifications = Notification.builder()
                    .account(account)
                    .title(NotificationTitle.VIEWING_REQUEST)
                    .message("Có yêu cầu xem nhà mới từ " + account.getLastName() + " " + account.getFirstName() + "!")
                    .isRead(false)
                    .notificationType(NotificationType.VIEWING_REQUEST.name())
                    .build();
            NotificationResponse notification = notificationMapper.toNotificationResponse(notifications);
            notificationRepository.save(notifications);
            log.info("Sending viewing request notification to owner: {}", owner.getAccount().getEmail());
            messagingTemplate.convertAndSendToUser(
                    owner.getAccount().getEmail(),
                    "/queue/notifications",
                    notification
            );
        }

        return propertyViewingMapper.toPropertyViewingResponse(propertyViewing);
    }
}
