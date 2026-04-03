package com.example.globalipplatform.project.service;

import com.example.globalipplatform.project.entity.Subscription;
import com.example.globalipplatform.project.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service 
public class SubscriptionServiceImpl implements SubscriptionService {

    @Override
    public Subscription subscribe(User user, String type, Long assetId) {
        return new Subscription(); // temporary
    }

    @Override
    public void unsubscribe(User user, String type, Long assetId) {
    }

    @Override
    public List<Subscription> listSubscriptions(User user) {
        return List.of();
    }

    @Override
    public boolean isSubscribed(User user, String type, Long assetId) {
        return false;
    }
}