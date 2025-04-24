package com.kir.homerentalsystem.repository;

import com.kir.homerentalsystem.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
