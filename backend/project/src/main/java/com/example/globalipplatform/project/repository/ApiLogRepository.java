package com.example.globalipplatform.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.globalipplatform.project.entity.ApiLog;

public interface ApiLogRepository extends JpaRepository<ApiLog, Long> {
}