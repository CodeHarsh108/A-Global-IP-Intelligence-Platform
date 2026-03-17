package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.entity.Subscription;
import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.repository.UserRepository;
import com.example.globalipplatform.project.service.SubscriptionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ip/subscriptions")
@CrossOrigin(origins = "http://localhost:3000")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    public SubscriptionController(SubscriptionService subscriptionService,
                                  UserRepository userRepository) {
        this.subscriptionService = subscriptionService;
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
            Subscription subscription = subscriptionService.subscribe(user, request.type, request.assetId);
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
            subscriptionService.unsubscribe(user, type, assetId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<Subscription>> listSubscriptions(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(subscriptionService.listSubscriptions(user));
    }

    @GetMapping("/{type}/{assetId}")
    public ResponseEntity<Map<String, Boolean>> checkSubscription(Authentication authentication,
                                                                  @PathVariable String type,
                                                                  @PathVariable Long assetId) {
        User user = getCurrentUser(authentication);
        boolean subscribed = subscriptionService.isSubscribed(user, type, assetId);
        return ResponseEntity.ok(Map.of("subscribed", subscribed));
    }
}

