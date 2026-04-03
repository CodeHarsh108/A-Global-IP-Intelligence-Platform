package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.DTO.SubscriptionDTO;
import com.example.globalipplatform.project.entity.Subscription;
import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.repository.UserRepository;
import com.example.globalipplatform.project.service.MonitoringService; 
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ip/subscriptions")
@CrossOrigin(origins = "http://localhost:3000")
public class SubscriptionController {

    private final MonitoringService monitoringService;  
    private final UserRepository userRepository;

    public SubscriptionController(MonitoringService monitoringService,  
                                  UserRepository userRepository) {
        this.monitoringService = monitoringService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Not authenticated");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public static class SubscriptionRequest {
        public String type;
        public Long assetId;
    }

    @PostMapping
    public ResponseEntity<?> createSubscription(Authentication authentication,
                                                @RequestBody SubscriptionRequest request) {
        try {
            User user = getCurrentUser(authentication);
            Subscription subscription = monitoringService.subscribe(user, request.type, request.assetId); // Changed
            return ResponseEntity.status(HttpStatus.CREATED).body(subscription);
        } catch (IllegalArgumentException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{type}/{assetId}")
    public ResponseEntity<?> deleteSubscription(Authentication authentication,
                                                @PathVariable String type,
                                                @PathVariable Long assetId) {
        try {
            User user = getCurrentUser(authentication);
            monitoringService.unsubscribe(user, type, assetId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }


    @GetMapping
public ResponseEntity<List<SubscriptionDTO>> listSubscriptions(Authentication authentication) {
    User user = getCurrentUser(authentication);
    List<Subscription> subscriptions = monitoringService.listSubscriptions(user);
    
    List<SubscriptionDTO> dtos = subscriptions.stream().map(sub -> {
        SubscriptionDTO dto = new SubscriptionDTO();
        dto.setId(sub.getId());
        dto.setCreated_at(sub.getCreated_at());
        
        if (sub.getPatent() != null) {
            dto.setAssetType("PATENT");
            dto.setAssetId(sub.getPatent().getId());
            dto.setTitle(sub.getPatent().getTitle());
            dto.setAssetNumber(sub.getPatent().getAssetNumber());
            dto.setJurisdiction(sub.getPatent().getJurisdiction());
            dto.setStatus(sub.getPatent().getStatus());
        } else if (sub.getTrademark() != null) {
            dto.setAssetType("TRADEMARK");
            dto.setAssetId(sub.getTrademark().getId());
            dto.setTitle(sub.getTrademark().getMark());
            dto.setAssetNumber(sub.getTrademark().getAssetNumber());
            dto.setJurisdiction(sub.getTrademark().getJurisdiction());
            dto.setStatus(sub.getTrademark().getStatus());
        }
        
        return dto;
    }).collect(Collectors.toList());
    
    return ResponseEntity.ok(dtos);
}

    @GetMapping("/{type}/{assetId}")
    public ResponseEntity<Map<String, Boolean>> checkSubscription(Authentication authentication,
                                                                  @PathVariable String type,
                                                                  @PathVariable Long assetId) {
        User user = getCurrentUser(authentication);
        boolean subscribed = monitoringService.isSubscribed(user, type, assetId); 
        return ResponseEntity.ok(Map.of("subscribed", subscribed));
    }
}