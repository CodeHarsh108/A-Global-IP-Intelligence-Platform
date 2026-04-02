package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.DTO.UserActivityDTO;
import com.example.globalipplatform.project.DTO.UserStatsDTO;
import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.repository.UserRepository;
import com.example.globalipplatform.project.service.UserDashboardService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user/dashboard")
public class UserDashboardController {

    private final UserDashboardService dashboardService;
    private final UserRepository userRepository;

    public UserDashboardController(UserDashboardService dashboardService,
                                   UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getStats(Authentication auth) {
        return ResponseEntity.ok(dashboardService.getUserStats(getCurrentUser(auth)));
    }

    @GetMapping("/activity")
    public ResponseEntity<List<UserActivityDTO>> getActivity(Authentication auth) {
        return ResponseEntity.ok(dashboardService.getUserActivity(getCurrentUser(auth)));
    }
}