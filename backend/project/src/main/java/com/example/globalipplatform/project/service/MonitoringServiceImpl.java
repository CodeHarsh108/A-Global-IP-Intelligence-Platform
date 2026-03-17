package com.example.globalipplatform.project.service;

import com.example.globalipplatform.project.entity.Filings;
import com.example.globalipplatform.project.entity.Notification;
import com.example.globalipplatform.project.entity.Patent;
import com.example.globalipplatform.project.entity.Subscription;
import com.example.globalipplatform.project.entity.Trademark;
import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.repository.FilingsRepository;
import com.example.globalipplatform.project.repository.NotificationRepository;
import com.example.globalipplatform.project.repository.PatentRepository;
import com.example.globalipplatform.project.repository.SubscriptionRepository;
import com.example.globalipplatform.project.repository.TrademarkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MonitoringServiceImpl implements MonitoringService {

    private final SubscriptionRepository subscriptionRepository;
    private final FilingsRepository filingsRepository;
    private final NotificationRepository notificationRepository;
    private final PatentRepository patentRepository;
    private final TrademarkRepository trademarkRepository;

    public MonitoringServiceImpl(SubscriptionRepository subscriptionRepository,
                                 FilingsRepository filingsRepository,
                                 NotificationRepository notificationRepository,
                                 PatentRepository patentRepository,
                                 TrademarkRepository trademarkRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.filingsRepository = filingsRepository;
        this.notificationRepository = notificationRepository;
        this.patentRepository = patentRepository;
        this.trademarkRepository = trademarkRepository;
    }

    @Override
    @Transactional
    public Subscription subscribe(User user, String assetType, long assetId) {
        if ("PATENT".equalsIgnoreCase(assetType)) {
            Patent patent = patentRepository.findById(assetId)
                    .orElseThrow(() -> new IllegalArgumentException("Patent not found with id " + assetId));
            if (subscriptionRepository.existsByUserAndPatent(user, patent)) {
                return subscriptionRepository.findByUserAndPatent(user, patent).orElseThrow();
            }
            Subscription subscription = new Subscription();
            subscription.setUser(user);
            subscription.setPatent(patent);
            subscription.setCreated_at(LocalDateTime.now());
            return subscriptionRepository.save(subscription);
        } else if ("TRADEMARK".equalsIgnoreCase(assetType)) {
            Trademark trademark = trademarkRepository.findById(assetId)
                    .orElseThrow(() -> new IllegalArgumentException("Trademark not found with id " + assetId));
            if (subscriptionRepository.existsByUserAndTrademark(user, trademark)) {
                return subscriptionRepository.findByUserAndTrademark(user, trademark).orElseThrow();
            }
            Subscription subscription = new Subscription();
            subscription.setUser(user);
            subscription.setTrademark(trademark);
            subscription.setCreated_at(LocalDateTime.now());
            return subscriptionRepository.save(subscription);
        } else {
            throw new IllegalArgumentException("Unsupported assetType: " + assetType);
        }
    }

    @Override
    @Transactional
    public void unsubscribe(User user, String assetType, long assetId) {
        if ("PATENT".equalsIgnoreCase(assetType)) {
            Patent patent = patentRepository.findById(assetId)
                    .orElseThrow(() -> new IllegalArgumentException("Patent not found with id " + assetId));
            subscriptionRepository.findByUserAndPatent(user, patent)
                    .ifPresent(subscriptionRepository::delete);
        } else if ("TRADEMARK".equalsIgnoreCase(assetType)) {
            Trademark trademark = trademarkRepository.findById(assetId)
                    .orElseThrow(() -> new IllegalArgumentException("Trademark not found with id " + assetId));
            subscriptionRepository.findByUserAndTrademark(user, trademark)
                    .ifPresent(subscriptionRepository::delete);
        } else {
            throw new IllegalArgumentException("Unsupported assetType: " + assetType);
        }
    }

    @Override
    public boolean isSubscribed(User user, String assetType, long assetId) {
        if ("PATENT".equalsIgnoreCase(assetType)) {
            Patent patent = patentRepository.findById(assetId)
                    .orElseThrow(() -> new IllegalArgumentException("Patent not found with id " + assetId));
            return subscriptionRepository.existsByUserAndPatent(user, patent);
        } else if ("TRADEMARK".equalsIgnoreCase(assetType)) {
            Trademark trademark = trademarkRepository.findById(assetId)
                    .orElseThrow(() -> new IllegalArgumentException("Trademark not found with id " + assetId));
            return subscriptionRepository.existsByUserAndTrademark(user, trademark);
        } else {
            throw new IllegalArgumentException("Unsupported assetType: " + assetType);
        }
    }

    @Override
    public List<Subscription> listSubscriptions(User user) {
        return subscriptionRepository.findByUser(user);
    }

    @Override
    @Transactional
    public Filings addFiling(String assetType, long assetId, String status, String description, LocalDateTime date) {
        Filings filings = new Filings();
        filings.setStatus(status);
        filings.setDescription(description);
        filings.setDate(date != null ? date : LocalDateTime.now());

        if ("PATENT".equalsIgnoreCase(assetType)) {
            Patent patent = patentRepository.findById(assetId)
                    .orElseThrow(() -> new IllegalArgumentException("Patent not found with id " + assetId));
            filings.setPatent(patent);
            Filings saved = filingsRepository.save(filings);
            createNotificationsForSubscribers("PATENT", patent.getTitle(), status, patent, null);
            return saved;
        } else if ("TRADEMARK".equalsIgnoreCase(assetType)) {
            Trademark trademark = trademarkRepository.findById(assetId)
                    .orElseThrow(() -> new IllegalArgumentException("Trademark not found with id " + assetId));
            filings.setTrademark(trademark);
            Filings saved = filingsRepository.save(filings);
            createNotificationsForSubscribers("TRADEMARK", trademark.getTitle(), status, null, trademark);
            return saved;
        } else {
            throw new IllegalArgumentException("Unsupported assetType: " + assetType);
        }
    }

    @Override
    public List<Filings> getFilingsTimeline(String assetType, long assetId) {
        if ("PATENT".equalsIgnoreCase(assetType)) {
            Patent patent = patentRepository.findById(assetId)
                    .orElseThrow(() -> new IllegalArgumentException("Patent not found with id " + assetId));
            return filingsRepository.findByPatentOrderByDateAsc(patent);
        } else if ("TRADEMARK".equalsIgnoreCase(assetType)) {
            Trademark trademark = trademarkRepository.findById(assetId)
                    .orElseThrow(() -> new IllegalArgumentException("Trademark not found with id " + assetId));
            return filingsRepository.findByTrademarkOrderByDateAsc(trademark);
        } else {
            throw new IllegalArgumentException("Unsupported assetType: " + assetType);
        }
    }

    private void createNotificationsForSubscribers(String assetType,
                                                   String assetTitle,
                                                   String status,
                                                   Patent patent,
                                                   Trademark trademark) {
        List<Subscription> subscriptions;
        if (patent != null) {
            subscriptions = subscriptionRepository.findByPatent(patent);
        } else if (trademark != null) {
            subscriptions = subscriptionRepository.findByTrademark(trademark);
        } else {
            return;
        }

        String message = String.format("%s \"%s\" status updated to %s", assetType, assetTitle, status);

        for (Subscription sub : subscriptions) {
            Notification notification = new Notification();
            notification.setUser(sub.getUser());
            notification.setPatent(patent);
            notification.setTrademark(trademark);
            notification.setMessage(message);
            notification.setType("STATUS_UPDATE");
            notification.setTimestamp(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }
}

