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
import com.example.globalipplatform.project.entity.Patent;
import com.example.globalipplatform.project.entity.Trademark;
import com.example.globalipplatform.project.repository.PatentRepository;
import com.example.globalipplatform.project.repository.TrademarkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MockIPService implements IPService {

    @Autowired
    private PatentRepository patentRepository;

    @Autowired
    private TrademarkRepository trademarkRepository;

    @Override
    public PatentSearchResponse searchPatents(PatentSearchRequest request, Pageable pageable) {
        Page<Patent> patentPage;

        if (request.getQuery() != null && !request.getQuery().isEmpty()) {
            patentPage = patentRepository.searchPatentsSimple(request.getQuery(), pageable);
        } else {
            patentPage = patentRepository.findAll(pageable);
        }

        List<PatentDTO> patents = patentPage.getContent()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new PatentSearchResponse(
                patents,
                patentPage.getTotalElements(),
                patentPage.getTotalPages(),
                patentPage.getNumber(),
                patentPage.getSize());
    }

    @Override
    @Cacheable(value = "patents", key = "#id")
    public PatentDTO getPatentById(Long id) {
        Patent patent = patentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patent not found with id: " + id));
        return convertToDTO(patent);
    }

    @Override
    public PatentDTO getPatentByNumber(String patentNumber) {
        Patent patent = patentRepository.findByAssetNumber(patentNumber);
        if (patent == null) {
            throw new RuntimeException("Patent not found with number: " + patentNumber);
        }
        return convertToDTO(patent);
    }

    @Override
    public List<String> getAllTechnologies() {
        return patentRepository.findAllTechnologies();
    }

    @Override
    public List<String> getAllPatentJurisdictions() {
        return patentRepository.findAllJurisdictions();
    }

    @Override
    public List<String> getAllPatentStatuses() {
        return patentRepository.findAllStatuses();
    }

    @Override
    public TrademarkSearchResponse searchTrademarks(TrademarkSearchRequest request, Pageable pageable) {
        // Fetch all trademarks and filter in Java — avoids JPQL dialect issues
        List<Trademark> all = trademarkRepository.findAll();

        String query = request.getQuery() != null ? request.getQuery().toLowerCase().trim() : null;
        String jurisdiction = request.getJurisdiction();
        String status = request.getStatus();
        String owner = request.getOwner() != null ? request.getOwner().toLowerCase().trim() : null;
        String niceClass = request.getNiceClass();
        Integer yearFrom = request.getYearFrom();
        Integer yearTo = request.getYearTo();

        List<Trademark> filtered = all.stream().filter(t -> {
            // query filter — matches mark, assignee, or goodsServices
            if (query != null && !query.isEmpty()) {
                boolean matches = false;
                if (t.getMark() != null && t.getMark().toLowerCase().contains(query))
                    matches = true;
                if (t.getAssignee() != null && t.getAssignee().toLowerCase().contains(query))
                    matches = true;
                if (t.getGoodsServices() != null && t.getGoodsServices().toLowerCase().contains(query))
                    matches = true;
                if (!matches)
                    return false;
            }
            // jurisdiction filter
            if (jurisdiction != null && !jurisdiction.isEmpty()) {
                if (!jurisdiction.equalsIgnoreCase(t.getJurisdiction()))
                    return false;
            }
            // status filter
            if (status != null && !status.isEmpty()) {
                if (!status.equalsIgnoreCase(t.getStatus()))
                    return false;
            }
            // owner filter
            if (owner != null && !owner.isEmpty()) {
                if (t.getAssignee() == null || !t.getAssignee().toLowerCase().contains(owner))
                    return false;
            }
            // niceClass filter
            if (niceClass != null && !niceClass.isEmpty()) {
                if (t.getNiceClasses() == null || !t.getNiceClasses().contains(niceClass))
                    return false;
            }
            // year range filter
            if (t.getFilingDate() != null) {
                int year = t.getFilingDate().getYear();
                if (yearFrom != null && year < yearFrom)
                    return false;
                if (yearTo != null && year > yearTo)
                    return false;
            }
            return true;
        }).collect(Collectors.toList());

        // Manual pagination
        int pageNum = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();
        int total = filtered.size();
        int totalPages = (int) Math.ceil((double) total / pageSize);
        int fromIdx = Math.min(pageNum * pageSize, total);
        int toIdx = Math.min(fromIdx + pageSize, total);
        List<Trademark> page = filtered.subList(fromIdx, toIdx);

        List<TrademarkDTO> trademarks = page.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new TrademarkSearchResponse(
                trademarks,
                total,
                totalPages,
                pageNum,
                pageSize);
    }

    @Override
    @Cacheable(value = "trademarks", key = "#id")
    public TrademarkDTO getTrademarkById(Long id) {
        Trademark trademark = trademarkRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trademark not found with id: " + id));
        return convertToDTO(trademark);
    }

    @Override
    public TrademarkDTO getTrademarkByNumber(String trademarkNumber) {
        Trademark trademark = trademarkRepository.findByAssetNumber(trademarkNumber);
        if (trademark == null) {
            throw new RuntimeException("Trademark not found with number: " + trademarkNumber);
        }
        return convertToDTO(trademark);
    }

    @Override
    public List<String> getAllTrademarkJurisdictions() {
        return trademarkRepository.findAllJurisdictions();
    }

    @Override
    public List<String> getAllTrademarkStatuses() {
        return trademarkRepository.findAllStatuses();
    }

    @Override
    public long getTotalPatentCount() {
        return patentRepository.count();
    }

    @Override
    public long getTotalTrademarkCount() {
        return trademarkRepository.count();
    }

    @Override
    public long getPatentCountByJurisdiction(String jurisdiction) {
        return 0; // Simplified for now
    }

    @Override
    public long getPatentCountByStatus(String status) {
        return 0; // Simplified for now
    }

    private PatentDTO convertToDTO(Patent patent) {
        PatentDTO dto = new PatentDTO();
        dto.setId(patent.getId());
        dto.setAssetNumber(patent.getAssetNumber());
        dto.setTitle(patent.getTitle());
        dto.setAbstractText(patent.getAbstractText());
        dto.setJurisdiction(patent.getJurisdiction());
        dto.setFilingDate(patent.getFilingDate());
        dto.setPublicationDate(patent.getPublicationDate());
        dto.setGrantDate(patent.getGrantDate());
        dto.setStatus(patent.getStatus());
        dto.setAssignee(patent.getAssignee());
        dto.setAssigneeCountry(patent.getAssigneeCountry());
        dto.setInventors(patent.getInventors());
        dto.setIpcClasses(patent.getIpcClasses());
        dto.setCpcClasses(patent.getCpcClasses());
        dto.setLegalStatus(patent.getLegalStatus());
        dto.setAnnualFeePaid(patent.getAnnualFeePaid());
        dto.setNextFeeDate(patent.getNextFeeDate());
        dto.setTechnology(patent.getTechnology());
        dto.setCitationCount(patent.getCitationCount());
        dto.setClaims(patent.getClaims());
        dto.setCitedPatents(patent.getCitedPatents());
        dto.setClaimCount(patent.getClaimCount());
        dto.setDrawingCount(patent.getDrawingCount());
        dto.setPatentType(patent.getPatentType());
        dto.setApplicationNumber(patent.getApplicationNumber());
        dto.setExaminer(patent.getExaminer());
        dto.setIsCorePatent(patent.getIsCorePatent());
        return dto;
    }

    private TrademarkDTO convertToDTO(Trademark trademark) {
        TrademarkDTO dto = new TrademarkDTO();
        dto.setId(trademark.getId());
        dto.setAssetNumber(trademark.getAssetNumber());
        dto.setMark(trademark.getMark());
        dto.setTitle(trademark.getTitle());
        dto.setJurisdiction(trademark.getJurisdiction());
        dto.setFilingDate(trademark.getFilingDate());
        dto.setStatus(trademark.getStatus());
        dto.setAssignee(trademark.getAssignee());
        dto.setMarkType(trademark.getMarkType());
        dto.setNiceClasses(trademark.getNiceClasses());
        dto.setGoodsServices(trademark.getGoodsServices());
        dto.setRegistrationNumber(trademark.getRegistrationNumber());
        dto.setApplicationNumber(trademark.getApplicationNumber());
        dto.setImageUrl(trademark.getImageUrl());
        dto.setIsLogo(trademark.getIsLogo());
        dto.setColorClaim(trademark.getColorClaim());
        dto.setRenewalDate(trademark.getRenewalDate());
        dto.setIsCoreTrademark(trademark.getIsCoreTrademark());
        return dto;
    }

    @Override
public List<FilingTrendDTO> getFilingTrends() {
    List<Object[]> patentYears = patentRepository.countPatentsByFilingYear();
    List<Object[]> trademarkYears = trademarkRepository.countTrademarksByFilingYear();
    
    Map<Integer, FilingTrendDTO> trendMap = new HashMap<>();
    for (Object[] row : patentYears) {
        int year = ((Number) row[0]).intValue();
        long count = ((Number) row[1]).longValue();
        trendMap.put(year, new FilingTrendDTO(year, count, 0));
    }
    for (Object[] row : trademarkYears) {
        int year = ((Number) row[0]).intValue();
        long count = ((Number) row[1]).longValue();
        trendMap.computeIfAbsent(year, k -> new FilingTrendDTO(year, 0, 0))
                .setTrademarkCount(count);
    }
    List<FilingTrendDTO> list = new ArrayList<>(trendMap.values());
    list.sort(Comparator.comparing(FilingTrendDTO::getYear));
    return list;
}

@Override
public List<TopCitedDTO> getTopCitedPatents(int limit) {
    List<Object[]> results = patentRepository.findTopCitedPatents(limit);
    return results.stream()
        .map(row -> new TopCitedDTO(
            ((Number) row[0]).longValue(),
            (String) row[1],
            ((Number) row[2]).intValue()
        ))
        .collect(Collectors.toList());
}

@Override
public List<FamilyDistributionDTO> getFamilyDistribution() {
    List<Object[]> results = patentRepository.countByFamilyId();
    return results.stream()
        .map(row -> new FamilyDistributionDTO(
            (String) row[0],
            ((Number) row[1]).longValue()
        ))
        .collect(Collectors.toList());
}

@Override
public List<TechnologyDistributionDTO> getTechnologyDistribution() {
    List<Object[]> results = patentRepository.countByTechnology();
    return results.stream()
        .map(row -> new TechnologyDistributionDTO(
            (String) row[0],
            ((Number) row[1]).longValue()
        ))
        .collect(Collectors.toList());
}


}