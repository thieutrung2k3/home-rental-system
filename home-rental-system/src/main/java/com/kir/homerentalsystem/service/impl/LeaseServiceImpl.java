package com.kir.homerentalsystem.service.impl;

import com.kir.homerentalsystem.constant.LeaseStatus;
import com.kir.homerentalsystem.constant.NotificationTitle;
import com.kir.homerentalsystem.constant.NotificationType;
import com.kir.homerentalsystem.dto.request.LeaseCreationRequest;
import com.kir.homerentalsystem.dto.response.ExportFileResponse;
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
import com.kir.homerentalsystem.util.TimeUtil;
import com.kir.homerentalsystem.util.WordUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
//        Property property = propertyRepository.findById(propertyId)
//                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_EXISTED));
//
//        if(property.getIsAvailable())
//            return true;
//
//        Optional<Lease> lease = leaseRepository.findByProperty_PropertyIdAndStatus(propertyId, "PREBOOKED");
//        if(lease.isPresent())
//            throw new AppException(ErrorCode.LEASE_EXISTED);
//
//        lease = leaseRepository.findByProperty_PropertyIdAndStatus(propertyId, "ACTIVE");
//        log.info("Lease: {}", lease.isPresent());
//        if(lease.isPresent()){
//            Lease currentLease = lease.get();
//            LocalDate endDate = currentLease.getEndDate();
//            LocalDate now = LocalDate.now();
//
//            boolean isLastMonth = now.getMonthValue() == endDate.getMonthValue()
//                    && now.getYear() == endDate.getYear();
//
//            Long daysLeft = ChronoUnit.DAYS.between(now, endDate);
//
//            boolean is15DaysLeft = daysLeft <= 15 && daysLeft > 0;
//
//            boolean isStartDateAfterCurrentEndDate = startDate.isAfter(endDate);
//
//            // Có thể đặt trước nếu:
//            // 1. Đang ở tháng cuối của hợp đồng
//            // 2. Chưa gia hạn
//            // 3. Đang trong 15 ngày cuối HOẶC đã quá 15 ngày cuối nhưng vẫn còn hợp đồng hiện tại
//            // 4. Ngày bắt đầu hợp đồng mới sau ngày kết thúc hợp đồng hiện tại
//
//            return isLastMonth && is15DaysLeft && isStartDateAfterCurrentEndDate;
//        }
        return false;
    }

    public boolean checkLeaseCreationConditions(Optional<Lease> lease, LocalDate startDate, LocalDate endDate){
        if(lease.isPresent()){
            Lease currentLease = lease.get();
            int lastMonthLeaseCurrentEnd = currentLease.getEndDate().getMonthValue();
            boolean isLastMonth = lastMonthLeaseCurrentEnd == LocalDate.now().getMonthValue()
                    && currentLease.getEndDate().getYear() == LocalDate.now().getYear();

            long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), currentLease.getEndDate());
            boolean is15daysLeft = daysLeft > 0 && daysLeft <= 15;

            boolean isStartDateAfterCurrentEndDate = startDate.isAfter(currentLease.getEndDate());

            return isLastMonth && is15daysLeft && isStartDateAfterCurrentEndDate;
        }
        return true;
    }



    @Override
    public LeaseResponse createLease(LeaseCreationRequest request) {
        String email = AuthUtil.getEmailFromToken();
        Tenant tenant = tenantRepository.findByAccount_Email(email)
                .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_EXISTED));

        //Xu ly request
        LocalDate startDate = TimeUtil.getFirstDateOfMonth(request.getStartMonth());
        LocalDate endDate = TimeUtil.getLastDateOfMonth(request.getEndMonth());

        //Kiem tra prop co ton tai khong
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_EXISTED));

        Optional<Lease> lease1 = leaseRepository.findByProperty_PropertyIdAndStatus(property.getPropertyId(), LeaseStatus.PREBOOKED.name());
        if(lease1.isPresent()){
            throw new AppException(ErrorCode.LEASE_EXISTED);
        }

        //Kiem tra xem prop co trong hop dong nao khong
        Optional<Lease> lease = leaseRepository.findByProperty_PropertyIdAndStatus(request.getPropertyId(), LeaseStatus.ACTIVE.name());
        if(!checkLeaseCreationConditions(lease, startDate, endDate)){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if(lease.isPresent()){
            Lease currentLease = lease.get();
            currentLease.setStatus(LeaseStatus.PREBOOKED.name());
            leaseRepository.save(currentLease);
        }

        Lease newLease = new Lease();
        newLease.setTenant(tenant);
        newLease.setProperty(property);
        newLease.setStartDate(startDate);
        newLease.setEndDate(endDate);
        newLease.setMonthlyRent(property.getPricePerMonth());
        newLease.setSecurityDeposit(property.getSecurityDeposit());
        newLease.setStatus(LeaseStatus.PENDING.name());

        leaseRepository.save(newLease);
        log.info("Creating lease: {}", newLease);

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

        return leaseMapper.toLeaseResponse(newLease);
    }

    @Transactional
    @Override
    public LeaseResponse createPrebookedLease(LeaseCreationRequest request) {
//        String email = AuthUtil.getEmailFromToken();
//
//        Tenant tenant = tenantRepository.findByAccount_Email(email)
//                .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_EXISTED));
//
//        Property property = propertyRepository.findById(request.getPropertyId())
//                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_EXISTED));
//
//        if(!canBePrebooked(request.getPropertyId(), request.getStartDate())){
//            throw new AppException(ErrorCode.UNAUTHENTICATED);
//        }
//
//        Lease lease = new Lease();
//        lease.setTenant(tenant);
//        lease.setProperty(property);
//        lease.setStartDate(request.getStartDate());
//        lease.setEndDate(request.getEndDate());
//        lease.setMonthlyRent(property.getPricePerMonth());
//        lease.setSecurityDeposit(property.getSecurityDeposit());
//        lease.setStatus("PREBOOKED");
//
//        lease = leaseRepository.save(lease);
//
//        property.setIsAvailable(false);
//        propertyRepository.save(property);
//
//        Notification notification = Notification.builder()
//                .account(property.getOwner().getAccount())
//                .title(NotificationTitle.LEASE_REQUEST)
//                .message("Có yêu cầu hợp đồng mới từ " + tenant.getAccount().getLastName() + " " + tenant.getAccount().getFirstName() + "!")
//                .isRead(false)
//                .notificationType(NotificationType.RENTAL_REQUEST.name())
//                .build();
//        notificationRepository.save(notification);
//
//        log.info("Sending rental request notification to owner: {}", property.getOwner().getAccount().getEmail());
//        NotificationResponse notificationResponse = notificationMapper.toNotificationResponse(notification);
//        messagingTemplate.convertAndSendToUser(
//                property.getOwner().getAccount().getEmail(),
//                "/queue/notifications",
//                notification);

        return leaseMapper.toLeaseResponse(null);
    }

    @Override
    public void startLease(LeaseCreationRequest request) {
//        String email = AuthUtil.getEmailFromToken();
//
//        Tenant tenant = tenantRepository.findByAccount_Email(email)
//                .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_EXISTED));
//
//        Property property = propertyRepository.findById(request.getPropertyId())
//                .orElseThrow(() -> new AppException(ErrorCode.PROPERTY_NOT_EXISTED));
//
//        Lease lease = new Lease();
//        lease.setTenant(tenant);
//        lease.setProperty(property);
//        lease.setStartDate(request.getStartDate());
//        lease.setEndDate(request.getEndDate());
    }

    @Override
    public void updateLeaseStatus(Long leaseId, LeaseStatus status) {
        Lease lease = leaseRepository.findById(leaseId)
                .orElseThrow(() -> new AppException(ErrorCode.LEASE_NOT_EXISTED));

        String email = AuthUtil.getEmailFromToken();
        if(!lease.getProperty().getOwner().getAccount().getEmail().equals(email)){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        lease.setStatus(status.name());
        log.info("Updating lease status: {}", lease);
        leaseRepository.save(lease);
        log.info("Lease status updated.");
    }

    @Override
    public List<LeaseResponse> getLeasesByStatusAndOwner(Long ownerId, LeaseStatus status) {
        String email = AuthUtil.getEmailFromToken();
        return leaseRepository.findAllByProperty_Owner_OwnerIdAndStatus(ownerId, status.name()).stream()
                .map(leaseMapper::toLeaseResponse)
                .collect(Collectors.toList());
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

    @Override
    public ExportFileResponse exportLease(Long leaseId) {
        Lease lease = leaseRepository.findById(leaseId)
                .orElseThrow(() -> new AppException(ErrorCode.LEASE_NOT_EXISTED));

        ByteArrayInputStream inputStream = WordUtil.fillTemplate(lease);

        try{
            byte[] bytes = inputStream.readAllBytes();

            return ExportFileResponse.builder()
                    .fileName("lease_" + lease.getLeaseId() + ".docx")
                    .contentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                    .data(bytes)
                    .build();
        }catch (Exception e){
            throw new AppException(ErrorCode.CAN_NOT_SAVE_FILE);
        }
    }
}
