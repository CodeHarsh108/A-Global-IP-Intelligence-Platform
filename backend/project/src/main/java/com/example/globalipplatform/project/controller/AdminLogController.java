package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.entity.ApiLog;
import com.example.globalipplatform.project.repository.ApiLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/logs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLogController {

    private final ApiLogRepository apiLogRepository;

    public AdminLogController(ApiLogRepository apiLogRepository) {
        this.apiLogRepository = apiLogRepository;
    }

    @GetMapping
    public ResponseEntity<Page<ApiLog>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String filter) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<ApiLog> logs = apiLogRepository.findAll(pageable);
        return ResponseEntity.ok(logs);
    }
}