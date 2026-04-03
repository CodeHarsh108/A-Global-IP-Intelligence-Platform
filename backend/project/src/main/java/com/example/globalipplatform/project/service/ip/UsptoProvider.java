package com.example.globalipplatform.project.service.ip;

import com.example.globalipplatform.project.DTO.IPDataDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsptoProvider implements IPSourceProvider {

    @Override
    public String getSourceName() {
        return "USPTO";
    }

    @Override
    public List<IPDataDTO> search(String query) {
        List<IPDataDTO> results = new ArrayList<>();

        // Mock data for USPTO
        results.add(IPDataDTO.builder()
                .id("US-" + System.currentTimeMillis() + "-1")
                .title("Dynamic User Interface for Agentic AI Systems")
                .description(
                        "An adaptive UI that adjusts components based on predicted task complexity and user cognitive load.")
                .applicationNumber("18/123,456")
                .applicant("Google DeepMind")
                .applicationDate(LocalDate.now().minusMonths(1))
                .status("GRANTED")
                .source("USPTO")
                .type("PATENT")
                .detailUrl("https://patents.google.com/patent/US18123456")
                .build());

        results.add(IPDataDTO.builder()
                .id("US-TM-" + System.currentTimeMillis() + "-2")
                .title("ANTIGRAVITY")
                .description("Software for autonomous coding and intelligent project management.")
                .applicationNumber("97/888,999")
                .applicant("Google LLC")
                .applicationDate(LocalDate.now().minusDays(15))
                .status("REGISTERED")
                .source("USPTO")
                .type("TRADEMARK")
                .detailUrl("https://tsdr.uspto.gov/#caseNumber=97888999")
                .build());

        return results.stream()
                .filter(res -> res.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                        res.getDescription().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
    }
}
