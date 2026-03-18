package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.entity.Filings;
import com.example.globalipplatform.project.service.FilingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ip/filings")
@CrossOrigin(origins = "http://localhost:3000")
public class FilingController {

    private final FilingService filingService;

    public FilingController(FilingService filingService) {
        this.filingService = filingService;
    }

    public static class FilingRequest {
        public String assetType;    
        public Long assetId;
        public String status;
        public String description;
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        public LocalDateTime date;    
    }

    @GetMapping("/{assetType}/{assetId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Filings>> getFilingsTimeline(
            @PathVariable String assetType,
            @PathVariable Long assetId) {
        try {
            List<Filings> filings = filingService.getFilingsTimeline(assetType, assetId);
            return ResponseEntity.ok(filings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public ResponseEntity<?> addFiling(@RequestBody FilingRequest request) {
        try {
            Filings filing = filingService.addFiling(
                    request.assetType,
                    request.assetId,
                    request.status,
                    request.description,
                    request.date != null ? request.date : LocalDateTime.now()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(filing);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}