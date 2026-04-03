package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.DTO.AnalystRequestResponseDTO;
import com.example.globalipplatform.project.DTO.ReviewRequestDTO;
import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.repository.UserRepository;
import com.example.globalipplatform.project.service.AnalystRegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/analyst-requests")
public class AdminAnalystRequestController {

    private final AnalystRegistrationService registrationService;
    private final UserRepository userRepository;

    public AdminAnalystRequestController(
            AnalystRegistrationService registrationService,
            UserRepository userRepository) {
        this.registrationService = registrationService;
        this.userRepository = userRepository;
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AnalystRequestResponseDTO>> getPendingRequests() {
        return ResponseEntity.ok(registrationService.getPendingRequests());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AnalystRequestResponseDTO>> getAllRequests() {
        return ResponseEntity.ok(registrationService.getAllRequests());
    }

    @PostMapping("/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reviewRequest(
            @RequestBody ReviewRequestDTO reviewDTO,
            @AuthenticationPrincipal UserDetails adminDetails) {
        
        User admin = userRepository.findByEmail(adminDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        try {
            AnalystRequestResponseDTO response = registrationService.reviewRequest(reviewDTO, admin.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
