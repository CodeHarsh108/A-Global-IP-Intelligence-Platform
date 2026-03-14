package com.example.globalipplatform.project.service.ip;

import com.example.globalipplatform.project.DTO.*;
import com.example.globalipplatform.project.service.MockIPService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InternalIPProvider implements IPSourceProvider {

    private final MockIPService mockIPService;

    public InternalIPProvider(MockIPService mockIPService) {
        this.mockIPService = mockIPService;
    }

    @Override
    public String getSourceName() {
        return "INTERNAL";
    }

    @Override
    public List<IPDataDTO> search(String query) {
        List<IPDataDTO> results = new ArrayList<>();

        // Search Patents
        PatentSearchRequest patentRequest = new PatentSearchRequest();
        patentRequest.setQuery(query);
        patentRequest.setJurisdiction("ALL");
        patentRequest.setStatus("ALL");
        
        Pageable patentPageable = PageRequest.of(0, 50); // Limit to top 50 for global search
        PatentSearchResponse patentResponse = mockIPService.searchPatents(patentRequest, patentPageable);
        
        if (patentResponse.getPatents() != null) {
            results.addAll(patentResponse.getPatents().stream()
                    .map(p -> IPDataDTO.builder()
                            .id("INT-P-" + p.getId())
                            .title(p.getTitle())
                            .description(p.getAbstractText())
                            .applicationNumber(p.getAssetNumber())
                            .applicant(p.getAssignee())
                            .applicationDate(p.getFilingDate() != null ? p.getFilingDate().toLocalDate() : null)
                            .status(p.getStatus())
                            .source("INTERNAL")
                            .type("PATENT")
                            .build())
                    .collect(Collectors.toList()));
        }

        // Search Trademarks
        TrademarkSearchRequest tmRequest = new TrademarkSearchRequest();
        tmRequest.setQuery(query);
        tmRequest.setJurisdiction("ALL");
        tmRequest.setStatus("ALL");

        Pageable tmPageable = PageRequest.of(0, 50);
        TrademarkSearchResponse tmResponse = mockIPService.searchTrademarks(tmRequest, tmPageable);

        if (tmResponse.getTrademarks() != null) {
            results.addAll(tmResponse.getTrademarks().stream()
                    .map(t -> IPDataDTO.builder()
                            .id("INT-T-" + t.getId())
                            .title(t.getMark())
                            .description(t.getGoodsServices())
                            .applicationNumber(t.getAssetNumber())
                            .applicant(t.getAssignee())
                            .applicationDate(t.getFilingDate() != null ? t.getFilingDate().toLocalDate() : null)
                            .status(t.getStatus())
                            .source("INTERNAL")
                            .type("TRADEMARK")
                            .build())
                    .collect(Collectors.toList()));
        }

        return results;
    }
}
