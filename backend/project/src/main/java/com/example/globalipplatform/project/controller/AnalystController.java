package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.DTO.FamilyDistributionDTO;
import com.example.globalipplatform.project.DTO.FilingTrendDTO;
import com.example.globalipplatform.project.DTO.TechnologyDistributionDTO;
import com.example.globalipplatform.project.DTO.TopCitedDTO;
import com.example.globalipplatform.project.repository.PatentRepository;
import com.example.globalipplatform.project.repository.SubscriptionRepository;
import com.example.globalipplatform.project.repository.TrademarkRepository;
import com.example.globalipplatform.project.service.IPService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analyst")
public class AnalystController {

    private final IPService ipService;
    private final PatentRepository patentRepository;
    private final TrademarkRepository trademarkRepository;
    private final SubscriptionRepository subscriptionRepository;

    public AnalystController(IPService ipService,
                             PatentRepository patentRepository,
                             TrademarkRepository trademarkRepository,
                             SubscriptionRepository subscriptionRepository) {
        this.ipService = ipService;
        this.patentRepository = patentRepository;
        this.trademarkRepository = trademarkRepository;
        this.subscriptionRepository = subscriptionRepository;
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

    // ✅ REAL DATA – counts from the database
    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ANALYST', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> response = new HashMap<>();
        response.put("totalPatents", patentRepository.count());
        response.put("totalTrademarks", trademarkRepository.count());
        response.put("activeMonitors", subscriptionRepository.count()); // total subscriptions = active monitors
        response.put("reportsGenerated", 42); // placeholder – you can replace with actual reports count later
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