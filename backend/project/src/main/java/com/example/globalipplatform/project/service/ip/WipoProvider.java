package com.example.globalipplatform.project.service.ip;

import com.example.globalipplatform.project.DTO.IPDataDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WipoProvider implements IPSourceProvider {

    @Override
    public String getSourceName() {
        return "WIPO";
    }

    @Override
    public List<IPDataDTO> search(String query) {
        List<IPDataDTO> results = new ArrayList<>();

        // Mock data for WIPO PATENTSCOPE
        results.add(IPDataDTO.builder()
                .id("WIPO-" + System.currentTimeMillis() + "-1")
                .title("Neural Network Optimization for Quantum Systems")
                .description("A method for optimizing neural network weights using quantum annealing processes...")
                .applicationNumber("PCT/IB2023/050123")
                .applicant("QuantumMind AI Corp")
                .applicationDate(LocalDate.now().minusMonths(3))
                .status("PUBLISHED")
                .source("WIPO")
                .type("PATENT")
                .detailUrl("https://patentscope.wipo.int/search/en/detail.jsf?docId=WO2023050123")
                .build());

        results.add(IPDataDTO.builder()
                .id("WIPO-" + System.currentTimeMillis() + "-2")
                .title("Eco-Friendly Graphene Synthesis")
                .description(
                        "Novel liquid-phase exfoliation method for high-yield graphene production using bio-compatible solvents.")
                .applicationNumber("PCT/CH2023/000456")
                .applicant("GreenNano Tech")
                .applicationDate(LocalDate.now().minusYears(1))
                .status("EXAMINATION")
                .source("WIPO")
                .type("PATENT")
                .detailUrl("https://patentscope.wipo.int/search/en/detail.jsf?docId=WO2023000456")
                .build());

        return results.stream()
                .filter(res -> res.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                        res.getDescription().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
    }
}
