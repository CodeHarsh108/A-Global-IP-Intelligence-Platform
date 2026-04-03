package com.example.globalipplatform.project.service.ip;

import com.example.globalipplatform.project.DTO.IPDataDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EpoProvider implements IPSourceProvider {

    @Override
    public String getSourceName() {
        return "EPO";
    }

    @Override
    public List<IPDataDTO> search(String query) {
        List<IPDataDTO> results = new ArrayList<>();

        // Mock data for EPO (European Patent Office)
        results.add(IPDataDTO.builder()
                .id("EP-" + System.currentTimeMillis() + "-1")
                .title("High-Efficiency Solid-State Batteries")
                .description("Composite electrolyte for lithium-metal batteries with improved dendritic resistance.")
                .applicationNumber("EP2023012345")
                .applicant("European Energy Research")
                .applicationDate(LocalDate.now().minusWeeks(10))
                .status("PUBLISHED")
                .source("EPO")
                .type("PATENT")
                .detailUrl("https://worldwide.espacenet.com/patent/search?q=EP2023012345")
                .build());

        return results.stream()
                .filter(res -> res.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                        res.getDescription().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
    }
}
