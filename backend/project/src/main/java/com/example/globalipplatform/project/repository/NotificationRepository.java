package com.example.globalipplatform.project.repository;

import com.example.globalipplatform.project.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}