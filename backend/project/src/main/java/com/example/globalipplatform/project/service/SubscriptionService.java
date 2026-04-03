package com.example.globalipplatform.project.service;

import com.example.globalipplatform.project.entity.Subscription;
import com.example.globalipplatform.project.entity.User;

import java.util.List;

public interface SubscriptionService {

    Subscription subscribe(User user, String type, Long assetId);

    void unsubscribe(User user, String type, Long assetId);

    List<Subscription> listSubscriptions(User user);

    boolean isSubscribed(User user, String type, Long assetId);
}