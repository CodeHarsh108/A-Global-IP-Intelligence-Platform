package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.DTO.Role;
import com.example.globalipplatform.project.DTO.RequestStatus;
import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.repository.AnalystRequestRepository;
import com.example.globalipplatform.project.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminUserController {

    private final UserRepository userRepository;
    private final AnalystRequestRepository analystRequestRepository;

    public AdminUserController(UserRepository userRepository, AnalystRequestRepository analystRequestRepository) {
        this.userRepository = userRepository;
        this.analystRequestRepository = analystRequestRepository;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = users.stream().map(user -> {
            String status = "Active";
            return Map.<String, Object>of(
                    "id", user.getId(),
                    "name", user.getUsername() != null ? user.getUsername() : "",
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "role", user.getRole() != null ? user.getRole().name() : "USER",
                    "status", status);
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getUserStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", userRepository.count());
        stats.put("active", userRepository.count()); // all users considered active
        stats.put("pending", analystRequestRepository.countByStatus(RequestStatus.PENDING));
        stats.put("analysts", userRepository.countByRole(Role.ANALYST));
        return ResponseEntity.ok(stats);
    }
}