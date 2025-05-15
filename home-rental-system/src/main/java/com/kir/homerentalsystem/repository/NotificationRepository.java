package com.kir.homerentalsystem.repository;

import com.kir.homerentalsystem.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import reactor.util.annotation.NonNullApi;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findAll(Pageable pageable);
}
