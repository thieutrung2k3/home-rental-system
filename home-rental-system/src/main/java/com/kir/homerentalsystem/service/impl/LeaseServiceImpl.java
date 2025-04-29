package com.kir.homerentalsystem.service.impl;

import com.kir.homerentalsystem.constant.LeaseStatus;
import com.kir.homerentalsystem.constant.NotificationTitle;
import com.kir.homerentalsystem.constant.NotificationType;
import com.kir.homerentalsystem.dto.request.LeaseCreationRequest;
import com.kir.homerentalsystem.dto.response.LeaseResponse;
import com.kir.homerentalsystem.dto.response.NotificationResponse;
import com.kir.homerentalsystem.entity.Lease;
import com.kir.homerentalsystem.entity.Notification;
import com.kir.homerentalsystem.entity.Property;
import com.kir.homerentalsystem.entity.Tenant;
import com.kir.homerentalsystem.exception.AppException;
import com.kir.homerentalsystem.exception.ErrorCode;
import com.kir.homerentalsystem.mapper.LeaseMapper;
import com.kir.homerentalsystem.mapper.NotificationMapper;
import com.kir.homerentalsystem.repository.*;
import com.kir.homerentalsystem.service.LeaseService;
import com.kir.homerentalsystem.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaseServiceImpl implements LeaseService {
    private final LeaseRepository leaseRepository;
    private final TenantRepository tenantRepository;
    private final PropertyRepository propertyRepository;
    private final LeaseMapper leaseMapper;

    private final SimpMessagingTemplate messagingTemplate;
    private final AccountRepository accountRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    /**
     * Kiểm tra xem tài sản có thể được đặt trước để thuê từ một ngày cụ thể không
     * @param propertyId - ID của tài sản
     * @param startDate - Ngày bắt đầu thuê
     * @return true nếu có thể đặt trước, false nếu không
     */
    @Override
    public boolean canBePrebooked(Long propertyId, LocalDate startDate) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_EXISTED));

        if(property.getIsAvailable())
            return true;

        Optional<Lease> lease = leaseRepository.findByProperty_PropertyIdAndStatus(propertyId, "PREBOOKED");
        if(lease.isPresent())
            throw new AppException(ErrorCode.LEASE_EXISTED);

        lease = leaseRepository.findByProperty_PropertyIdAndStatus(propertyId, "ACTIVE");
        log.info("Lease: {}", lease.isPresent());
        if(lease.isPresent()){
            Lease currentLease = lease.get();
            LocalDate endDate = currentLease.getEndDate();
            LocalDate now = LocalDate.now();

            boolean isLastMonth = now.getMonthValue() == endDate.getMonthValue()
                    && now.getYear() == endDate.getYear();

            Long daysLeft = ChronoUnit.DAYS.between(now, endDate);

            boolean is15DaysLeft = daysLeft <= 15 && daysLeft > 0;

            boolean isStartDateAfterCurrentEndDate = startDate.isAfter(endDate);

            // Có thể đặt trước nếu:
            // 1. Đang ở tháng cuối của hợp đồng
            // 2. Chưa gia hạn
            // 3. Đang trong 15 ngày cuối HOẶC đã quá 15 ngày cuối nhưng vẫn còn hợp đồng hiện tại
            // 4. Ngày bắt đầu hợp đồng mới sau ngày kết thúc hợp đồng hiện tại

            return isLastMonth && is15DaysLeft && isStartDateAfterCurrentEndDate;
        }
        return false;
    }

    @Transactional
    @Override
    public LeaseResponse createPrebookedLease(LeaseCreationRequest request) {
        String email = AuthUtil.getEmailFromToken();

        Tenant tenant = tenantRepository.findByAccount_Email(email)
                .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_EXISTED));

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_EXISTED));

        if(!canBePrebooked(request.getPropertyId(), request.getStartDate())){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        Lease lease = new Lease();
        lease.setTenant(tenant);
        lease.setProperty(property);
        lease.setStartDate(request.getStartDate());
        lease.setEndDate(request.getEndDate());
        lease.setMonthlyRent(property.getPricePerMonth());
        lease.setSecurityDeposit(property.getSecurityDeposit());
        lease.setStatus("PREBOOKED");

        lease = leaseRepository.save(lease);

        property.setIsAvailable(false);
        propertyRepository.save(property);

        Notification notification = Notification.builder()
                .account(property.getOwner().getAccount())
                .title(NotificationTitle.LEASE_REQUEST)
                .message("Có yêu cầu hợp đồng mới từ " + tenant.getAccount().getLastName() + " " + tenant.getAccount().getFirstName() + "!")
                .isRead(false)
                .notificationType(NotificationType.RENTAL_REQUEST.name())
                .build();
        notificationRepository.save(notification);

        log.info("Sending rental request notification to owner: {}", property.getOwner().getAccount().getEmail());
        NotificationResponse notificationResponse = notificationMapper.toNotificationResponse(notification);
        messagingTemplate.convertAndSendToUser(
                property.getOwner().getAccount().getEmail(),
                "/queue/notifications",
                notification);

        return leaseMapper.toLeaseResponse(lease);
    }

    @Override
    public void startLease(LeaseCreationRequest request) {
        String email = AuthUtil.getEmailFromToken();

        Tenant tenant = tenantRepository.findByAccount_Email(email)
                .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_EXISTED));

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_EXISTED));

        Lease lease = new Lease();
        lease.setTenant(tenant);
        lease.setProperty(property);
        lease.setStartDate(request.getStartDate());
        lease.setEndDate(request.getEndDate());
    }

    @Override
    @Scheduled(cron = "0 35 10 * * *")
    public void activePrebookedLease() {
        List<Lease> leases = leaseRepository.findAllByStatusAndStartDate("PREBOOKED", LocalDate.now());
        if (!leases.isEmpty()) {
            leases.forEach(lease -> {
                lease.setStatus(LeaseStatus.ACTIVE.name());
                log.info("Lease {} has been active.", lease.getLeaseId());
            });
        }
        leaseRepository.saveAll(leases);
        log.info("Active prebooked lease finished.");
    }
}
