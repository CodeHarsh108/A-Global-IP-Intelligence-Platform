package com.example.globalipplatform.project.service.ip;

import com.example.globalipplatform.project.DTO.IPDataDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TmViewProvider implements IPSourceProvider {

    @Override
    public String getSourceName() {
        return "TMView";
    }

    @Override
    public List<IPDataDTO> search(String query) {
        List<IPDataDTO> results = new ArrayList<>();

        // Mock data for TMView (EUIPO)
        results.add(IPDataDTO.builder()
                .id("TMV-" + System.currentTimeMillis() + "-1")
                .title("SOLARIS CORE")
                .description("Energy management systems for sustainable housing developments.")
                .applicationNumber("EU-018765432")
                .applicant("Solaris European Solutions")
                .applicationDate(LocalDate.now().minusMonths(6))
                .status("REGISTERED")
                .source("TMView")
                .type("TRADEMARK")
                .detailUrl("https://www.euipo.europa.eu/eSearch/#details/trademarks/018765432")
                .build());

        return results.stream()
                .filter(res -> res.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                        res.getDescription().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
    }
}
