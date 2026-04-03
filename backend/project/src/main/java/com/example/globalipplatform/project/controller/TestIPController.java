package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.DTO.PatentSearchRequest;
import com.example.globalipplatform.project.DTO.PatentSearchResponse;
import com.example.globalipplatform.project.service.IPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test-ip")
@CrossOrigin(origins = "http://localhost:3000")
public class TestIPController {

    @Autowired
    private IPService ipService;

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Test IP controller is working");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/simple-search")
    public ResponseEntity<?> simpleSearch(@RequestBody(required = false) Map<String, String> request) {
        try {
            String query = request != null ? request.get("query") : "";
            Pageable pageable = PageRequest.of(0, 10);
            
            PatentSearchRequest searchRequest = new PatentSearchRequest();
            searchRequest.setQuery(query);
            
            PatentSearchResponse response = ipService.searchPatents(searchRequest, pageable);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}