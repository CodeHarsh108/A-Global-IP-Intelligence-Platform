package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.DTO.PatentDTO;
import com.example.globalipplatform.project.DTO.PatentSearchRequest;
import com.example.globalipplatform.project.DTO.PatentSearchResponse;
import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.entity.UserSearch;
import com.example.globalipplatform.project.repository.UserRepository;
import com.example.globalipplatform.project.repository.UserSearchRepository;
import com.example.globalipplatform.project.service.IPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.Authenticator;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ip/patents")
public class PatentController {

    @Autowired
    private IPService ipService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSearchRepository userSearchRepository;

    @PostMapping("/search")
    public ResponseEntity<?> searchPatents(
            @RequestBody PatentSearchRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            Authentication authentication
        ) {

         
        try {
            // If request is null, create empty request
            if (request == null) {
                request = new PatentSearchRequest();
            }
            
            System.out.println("Search request: " + request);
            
            Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), 
                               sortBy != null ? sortBy : "filingDate");
            Pageable pageable = PageRequest.of(page, size, sort);
            
            PatentSearchResponse response = ipService.searchPatents(request, pageable);
             if (authentication != null && authentication.isAuthenticated()) {
                String email = authentication.getName();
                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    UserSearch userSearch = UserSearch.builder()
                            .user(user)
                            .query(request.getQuery() != null ? request.getQuery() : "")
                            .filters(buildFiltersString(request))
                            .resultCount((int) response.getTotalElements())
                            .searchedAt(LocalDateTime.now())
                            .build();
                    userSearchRepository.save(userSearch);
                }
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }

    }


    private String buildFiltersString(PatentSearchRequest request) {
        // Simple concatenation – can be improved
        StringBuilder sb = new StringBuilder();
        if (request.getJurisdiction() != null) sb.append("jurisdiction:").append(request.getJurisdiction()).append(";");
        if (request.getStatus() != null) sb.append("status:").append(request.getStatus()).append(";");
        if (request.getAssignee() != null) sb.append("assignee:").append(request.getAssignee()).append(";");
        if (request.getTechnology() != null) sb.append("technology:").append(request.getTechnology()).append(";");
        return sb.toString();
    }
    


    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPatentById(@PathVariable Long id) {
        try {
            PatentDTO patent = ipService.getPatentById(id);
            return ResponseEntity.ok(patent);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Patent not found with id: " + id);
            return ResponseEntity.status(404).body(error);
        }
    }

    @GetMapping("/number/{patentNumber}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPatentByNumber(@PathVariable String patentNumber) {
        try {
            PatentDTO patent = ipService.getPatentByNumber(patentNumber);
            return ResponseEntity.ok(patent);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Patent not found with number: " + patentNumber);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/test")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Patent controller is working!");
        response.put("authenticated", "true");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/technologies")
    public ResponseEntity<List<String>> getAllTechnologies() {
        return ResponseEntity.ok(ipService.getAllTechnologies());
    }

    @GetMapping("/jurisdictions")
    public ResponseEntity<List<String>> getAllJurisdictions() {
        return ResponseEntity.ok(ipService.getAllPatentJurisdictions());
    }

    @GetMapping("/statuses")
    public ResponseEntity<List<String>> getAllStatuses() {
        return ResponseEntity.ok(ipService.getAllPatentStatuses());
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getTotalCount() {
        return ResponseEntity.ok(ipService.getTotalPatentCount());
    }

    @GetMapping("/count/jurisdiction/{jurisdiction}")
    public ResponseEntity<Long> getCountByJurisdiction(@PathVariable String jurisdiction) {
        return ResponseEntity.ok(ipService.getPatentCountByJurisdiction(jurisdiction));
    }

    @GetMapping("/count/status/{status}")
    public ResponseEntity<Long> getCountByStatus(@PathVariable String status) {
        return ResponseEntity.ok(ipService.getPatentCountByStatus(status));
    }
}