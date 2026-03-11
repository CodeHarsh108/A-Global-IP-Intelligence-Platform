package com.example.globalipplatform.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.example.globalipplatform.project.DTO.FamilyDistributionDTO;
import com.example.globalipplatform.project.DTO.FilingTrendDTO;
import com.example.globalipplatform.project.DTO.TechnologyDistributionDTO;
import com.example.globalipplatform.project.DTO.TopCitedDTO;
import com.example.globalipplatform.project.service.IPService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analyst")
public class AnalystController {

    private final IPService ipService;

    public AnalystController(IPService ipService) {
        this.ipService = ipService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getAnalystDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome to Analyst Dashboard");
        response.put("user", userDetails.getUsername());
        response.put("role", userDetails.getAuthorities());
        response.put("features", new String[]{
            "Advanced Analytics",
            "Data Export",
            "Report Generation",
            "Trend Analysis",
            "Competitor Tracking"
        });
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> response = new HashMap<>();
        response.put("totalPatents", 1245);
        response.put("totalTrademarks", 876);
        response.put("activeMonitors", 23);
        response.put("reportsGenerated", 45);
        response.put("trends", new String[]{
            "AI Technology ↑ 25%",
            "Biotechnology ↑ 18%",
            "Semiconductors ↑ 32%"
        });
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getReports() {
        Map<String, Object> response = new HashMap<>();
        response.put("reports", new Object[]{
            new HashMap<String, Object>() {{
                put("id", 1);
                put("name", "Q1 2026 Patent Landscape");
                put("date", "2026-01-15");
                put("type", "PDF");
            }},
            new HashMap<String, Object>() {{
                put("id", 2);
                put("name", "Competitor Analysis - Tech Sector");
                put("date", "2026-01-10");
                put("type", "Excel");
            }}
        });
        return ResponseEntity.ok(response);
    }


@GetMapping("/visualizations/trends")
@PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
public ResponseEntity<List<FilingTrendDTO>> getFilingTrends() {
    return ResponseEntity.ok(ipService.getFilingTrends());
}

@GetMapping("/visualizations/top-cited")
@PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
public ResponseEntity<List<TopCitedDTO>> getTopCited(
        @RequestParam(defaultValue = "10") int limit) {
    return ResponseEntity.ok(ipService.getTopCitedPatents(limit));
}

@GetMapping("/visualizations/families")
@PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
public ResponseEntity<List<FamilyDistributionDTO>> getFamilyDistribution() {
    return ResponseEntity.ok(ipService.getFamilyDistribution());
}

@GetMapping("/visualizations/technologies")
@PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
public ResponseEntity<List<TechnologyDistributionDTO>> getTechnologyDistribution() {
    return ResponseEntity.ok(ipService.getTechnologyDistribution());
}

}