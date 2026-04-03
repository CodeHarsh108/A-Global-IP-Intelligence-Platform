package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.DTO.TrademarkDTO;
import com.example.globalipplatform.project.DTO.TrademarkSearchRequest;
import com.example.globalipplatform.project.DTO.TrademarkSearchResponse;
import com.example.globalipplatform.project.service.IPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ip/trademarks")
public class TrademarkController {

    @Autowired
    private IPService ipService;

    @PostMapping("/search")
    public ResponseEntity<TrademarkSearchResponse> searchTrademarks(
            @RequestBody(required = false) TrademarkSearchRequest request,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = "desc") String sortOrder) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), 
                           sortBy != null ? sortBy : "filingDate");
        Pageable pageable = PageRequest.of(page, size, sort);
        
        TrademarkSearchResponse response = ipService.searchTrademarks(request, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrademarkDTO> getTrademarkById(@PathVariable Long id) {
        TrademarkDTO trademark = ipService.getTrademarkById(id);
        return ResponseEntity.ok(trademark);
    }

    @GetMapping("/number/{trademarkNumber}")
    public ResponseEntity<TrademarkDTO> getTrademarkByNumber(@PathVariable String trademarkNumber) {
        TrademarkDTO trademark = ipService.getTrademarkByNumber(trademarkNumber);
        return ResponseEntity.ok(trademark);
    }

    @GetMapping("/jurisdictions")
    public ResponseEntity<List<String>> getAllJurisdictions() {
        return ResponseEntity.ok(ipService.getAllTrademarkJurisdictions());
    }

    @GetMapping("/statuses")
    public ResponseEntity<List<String>> getAllStatuses() {
        return ResponseEntity.ok(ipService.getAllTrademarkStatuses());
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getTotalCount() {
        return ResponseEntity.ok(ipService.getTotalTrademarkCount());
    }
}