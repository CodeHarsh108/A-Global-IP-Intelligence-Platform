package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.DTO.IPDataDTO;
import com.example.globalipplatform.project.service.ip.IPSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ip")
@CrossOrigin(origins = "http://localhost:3000")
public class IPSearchController {

    private final IPSearchService ipSearchService;

    public IPSearchController(IPSearchService ipSearchService) {
        this.ipSearchService = ipSearchService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<IPDataDTO>> search(
            @RequestParam("query") String query,
            @RequestParam(value = "source", defaultValue = "ALL") String source) {

        System.out.println("=== Global IP Search Request ===");
        System.out.println("Query: " + query);
        System.out.println("Source: " + source);

        try {
            List<IPDataDTO> results = ipSearchService.search(query, source);
            System.out.println("Found " + results.size() + " results");
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("Search failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
