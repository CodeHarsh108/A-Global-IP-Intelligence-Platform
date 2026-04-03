package com.example.globalipplatform.project.service;

import com.example.globalipplatform.project.entity.Filings;

import java.time.LocalDateTime;
import java.util.List;

public interface FilingService {

    Filings addFiling(String assetType, long assetId, String status, String description, LocalDateTime date);

    List<Filings> getFilingsTimeline(String assetType, long assetId);
}

