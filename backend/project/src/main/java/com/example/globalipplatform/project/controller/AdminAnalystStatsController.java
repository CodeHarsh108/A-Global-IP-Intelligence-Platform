package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.service.AnalystRegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analyst-requests")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalystStatsController {

    private final AnalystRegistrationService analystRegistrationService;

    public AdminAnalystStatsController(AnalystRegistrationService analystRegistrationService) {
        this.analystRegistrationService = analystRegistrationService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("pending", analystRegistrationService.getPendingRequestsCount());
        stats.put("approvedToday", analystRegistrationService.getApprovedTodayCount());
        stats.put("rejectedToday", analystRegistrationService.getRejectedTodayCount());
        return ResponseEntity.ok(stats);
    }
}