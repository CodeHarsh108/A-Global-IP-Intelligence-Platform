package com.example.globalipplatform.project.service;

import com.example.globalipplatform.project.DTO.FamilyDistributionDTO;
import com.example.globalipplatform.project.DTO.FilingTrendDTO;
import com.example.globalipplatform.project.DTO.PatentDTO;
import com.example.globalipplatform.project.DTO.PatentSearchRequest;
import com.example.globalipplatform.project.DTO.PatentSearchResponse;
import com.example.globalipplatform.project.DTO.TechnologyDistributionDTO;
import com.example.globalipplatform.project.DTO.TopCitedDTO;
import com.example.globalipplatform.project.DTO.TrademarkDTO;
import com.example.globalipplatform.project.DTO.TrademarkSearchRequest;
import com.example.globalipplatform.project.DTO.TrademarkSearchResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IPService {
    
    // Patent methods
    PatentSearchResponse searchPatents(PatentSearchRequest request, Pageable pageable);
    PatentDTO getPatentById(Long id);
    PatentDTO getPatentByNumber(String patentNumber);
    List<String> getAllTechnologies();
    List<String> getAllPatentJurisdictions();
    List<String> getAllPatentStatuses();
    
    // Trademark methods
    TrademarkSearchResponse searchTrademarks(TrademarkSearchRequest request, Pageable pageable);
    TrademarkDTO getTrademarkById(Long id);
    TrademarkDTO getTrademarkByNumber(String trademarkNumber);
    List<String> getAllTrademarkJurisdictions();
    List<String> getAllTrademarkStatuses();
    
    // Analytics methods
    long getTotalPatentCount();
    long getTotalTrademarkCount();
    long getPatentCountByJurisdiction(String jurisdiction);
    long getPatentCountByStatus(String status);

List<FilingTrendDTO> getFilingTrends();
List<TopCitedDTO> getTopCitedPatents(int limit);
List<FamilyDistributionDTO> getFamilyDistribution();
List<TechnologyDistributionDTO> getTechnologyDistribution();
}