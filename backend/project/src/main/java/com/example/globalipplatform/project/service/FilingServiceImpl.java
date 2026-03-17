package com.example.globalipplatform.project.service;

import com.example.globalipplatform.project.entity.Filings;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FilingServiceImpl implements FilingService {

    private final MonitoringService monitoringService;

    public FilingServiceImpl(MonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @Override
    public Filings addFiling(String assetType, long assetId, String status, String description, LocalDateTime date) {
        return monitoringService.addFiling(assetType, assetId, status, description, date);
    }

    @Override
    public List<Filings> getFilingsTimeline(String assetType, long assetId) {
        return monitoringService.getFilingsTimeline(assetType, assetId);
    }
}

