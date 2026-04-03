package com.example.globalipplatform.project.service;

import com.example.globalipplatform.project.entity.Filings;
import com.example.globalipplatform.project.entity.Subscription;
import com.example.globalipplatform.project.entity.User;

import java.time.LocalDateTime;
import java.util.List;

public interface MonitoringService {

    Subscription subscribe(User user, String assetType, long assetId);

    void unsubscribe(User user, String assetType, long assetId);

    boolean isSubscribed(User user, String assetType, long assetId);

    List<Subscription> listSubscriptions(User user);

    Filings addFiling(String assetType, long assetId, String status, String description, LocalDateTime date);

    List<Filings> getFilingsTimeline(String assetType, long assetId);
}

