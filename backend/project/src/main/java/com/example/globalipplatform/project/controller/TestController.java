package com.example.globalipplatform.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> publicEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "This is a public endpoint - no authentication required");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('USER', 'ANALYST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> userEndpoint(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "This endpoint is accessible by USER, ANALYST, and ADMIN roles");
        response.put("user", userDetails.getUsername());
        response.put("roles", userDetails.getAuthorities());
        response.put("features", new String[]{
            "Basic Search",
            "View Patents",
            "Subscribe to Updates"
        });
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analyst")
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> analystEndpoint(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "This endpoint is accessible by ANALYST and ADMIN roles only");
        response.put("analyst", userDetails.getUsername());
        response.put("roles", userDetails.getAuthorities());
        response.put("features", new String[]{
            "Advanced Analytics",
            "Data Export",
            "Report Generation"
        });
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminEndpoint(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "This endpoint is accessible by ADMIN role only");
        response.put("admin", userDetails.getUsername());
        response.put("roles", userDetails.getAuthorities());
        response.put("features", new String[]{
            "User Management",
            "System Configuration",
            "API Monitoring"
        });
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        if (userDetails != null) {
            response.put("username", userDetails.getUsername());
            response.put("authorities", userDetails.getAuthorities());
            response.put("authenticated", true);
            response.put("timestamp", LocalDateTime.now().toString());
        } else {
            response.put("authenticated", false);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Backend is running");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}