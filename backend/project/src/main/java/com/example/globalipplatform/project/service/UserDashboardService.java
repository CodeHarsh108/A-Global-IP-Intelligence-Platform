package com.example.globalipplatform.project.service;

import com.example.globalipplatform.project.DTO.UserActivityDTO;
import com.example.globalipplatform.project.DTO.UserStatsDTO;
import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserDashboardService {

    private final UserSearchRepository userSearchRepository;
    private final UserSavedIpAssetRepository savedAssetRepository;
    private final SubscriptionRepository subscriptionRepository;

    public UserDashboardService(UserSearchRepository userSearchRepository,
                                UserSavedIpAssetRepository savedAssetRepository,
                                SubscriptionRepository subscriptionRepository) {
        this.userSearchRepository = userSearchRepository;
        this.savedAssetRepository = savedAssetRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    public UserStatsDTO getUserStats(User user) {
        long totalSearches = userSearchRepository.countByUser(user);
        long savedAssets = savedAssetRepository.countByUser(user);
        long activeSubscriptions = subscriptionRepository.countByUser(user);
        return new UserStatsDTO(totalSearches, savedAssets, activeSubscriptions);
    }

    public List<UserActivityDTO> getUserActivity(User user) {
        List<UserActivityDTO> activities = new ArrayList<>();

        // Recent searches
        userSearchRepository.findTop10ByUserOrderBySearchedAtDesc(user)
                .forEach(search -> activities.add(new UserActivityDTO(
                        "SEARCH",
                        "Search: " + search.getQuery(),
                        "Found " + search.getResultCount() + " results",
                        search.getSearchedAt()
                )));

        // Saved assets – use native query with userId
        savedAssetRepository.findTop10ByUserOrderBySavedAtDesc(user.getId())
                .forEach(saved -> {
                    String assetTitle = saved.getPatent() != null ? saved.getPatent().getTitle() : saved.getTrademark().getMark();
                    activities.add(new UserActivityDTO(
                            "SAVED",
                            "Saved IP Asset",
                            assetTitle,
                            saved.getSavedAt()
                    ));
                });

        // Subscriptions – use Pageable to get top 10
        Pageable topTen = PageRequest.of(0, 10);
        subscriptionRepository.findTop10ByUserOrderByCreatedAtDesc(user, topTen)
                .forEach(sub -> {
                    String assetTitle = sub.getPatent() != null ? sub.getPatent().getTitle() : sub.getTrademark().getMark();
                    activities.add(new UserActivityDTO(
                            "SUBSCRIBED",
                            "Subscribed to updates",
                            assetTitle,
                            sub.getCreated_at()
                    ));
                });

        // Sort all activities by timestamp descending and limit to 20
        return activities.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(20)
                .collect(Collectors.toList());
    }
}