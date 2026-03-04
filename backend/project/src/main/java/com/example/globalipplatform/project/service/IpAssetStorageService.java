package com.example.globalipplatform.project.service;

import com.example.globalipplatform.project.DTO.SavedIpAssetItemDTO;
import com.example.globalipplatform.project.entity.Patent;
import com.example.globalipplatform.project.entity.Trademark;
import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.entity.UserSavedIpAsset;
import com.example.globalipplatform.project.repository.PatentRepository;
import com.example.globalipplatform.project.repository.TrademarkRepository;
import com.example.globalipplatform.project.repository.UserRepository;
import com.example.globalipplatform.project.repository.UserSavedIpAssetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IpAssetStorageService {

    private final UserSavedIpAssetRepository savedAssetRepository;
    private final UserRepository userRepository;
    private final PatentRepository patentRepository;
    private final TrademarkRepository trademarkRepository;

    public IpAssetStorageService(UserSavedIpAssetRepository savedAssetRepository,
                                 UserRepository userRepository,
                                 PatentRepository patentRepository,
                                 TrademarkRepository trademarkRepository) {
        this.savedAssetRepository = savedAssetRepository;
        this.userRepository = userRepository;
        this.patentRepository = patentRepository;
        this.trademarkRepository = trademarkRepository;
    }

    /** Save a patent or trademark to the user's IP assets. Asset must already exist in DB (e.g. from search). */
    @Transactional
    public SavedIpAssetItemDTO save(Long userId, String type, Long assetId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if ("PATENT".equalsIgnoreCase(type)) {
            Patent patent = patentRepository.findById(assetId).orElseThrow(() -> new IllegalArgumentException("Patent not found"));
            if (savedAssetRepository.existsByUserIdAndPatentId(userId, assetId))
                return toItem(userId, type, patent, null);
            UserSavedIpAsset saved = UserSavedIpAsset.builder()
                .user(user)
                .patent(patent)
                .build();
            savedAssetRepository.save(saved);
            return toItem(userId, type, patent, null);
        } else if ("TRADEMARK".equalsIgnoreCase(type)) {
            Trademark trademark = trademarkRepository.findById(assetId).orElseThrow(() -> new IllegalArgumentException("Trademark not found"));
            if (savedAssetRepository.existsByUserIdAndTrademarkId(userId, assetId))
                return toItem(userId, type, null, trademark);
            UserSavedIpAsset saved = UserSavedIpAsset.builder()
                .user(user)
                .trademark(trademark)
                .build();
            savedAssetRepository.save(saved);
            return toItem(userId, type, null, trademark);
        }
        throw new IllegalArgumentException("type must be PATENT or TRADEMARK");
    }

    @Transactional
    public void remove(Long userId, String type, Long assetId) {
        if ("PATENT".equalsIgnoreCase(type))
            savedAssetRepository.deleteByUserIdAndPatentId(userId, assetId);
        else if ("TRADEMARK".equalsIgnoreCase(type))
            savedAssetRepository.deleteByUserIdAndTrademarkId(userId, assetId);
        else
            throw new IllegalArgumentException("type must be PATENT or TRADEMARK");
    }

    public List<SavedIpAssetItemDTO> listSaved(Long userId) {
        return savedAssetRepository.findAllByUserIdOrderBySavedAtDesc(userId).stream()
            .map(this::toItem)
            .collect(Collectors.toList());
    }

    public boolean isSaved(Long userId, String type, Long assetId) {
        if ("PATENT".equalsIgnoreCase(type))
            return savedAssetRepository.existsByUserIdAndPatentId(userId, assetId);
        if ("TRADEMARK".equalsIgnoreCase(type))
            return savedAssetRepository.existsByUserIdAndTrademarkId(userId, assetId);
        return false;
    }

    private SavedIpAssetItemDTO toItem(UserSavedIpAsset s) {
        if (s.getPatent() != null)
            return SavedIpAssetItemDTO.builder()
                .type("PATENT")
                .assetId(s.getPatent().getId())
                .title(s.getPatent().getTitle())
                .applicationNumber(s.getPatent().getApplicationNumber())
                .status(s.getPatent().getStatus())
                .jurisdiction(s.getPatent().getJurisdiction())
                .filingDate(s.getPatent().getFilingDate())
                .savedAt(s.getSavedAt())
                .build();
        if (s.getTrademark() != null)
            return SavedIpAssetItemDTO.builder()
                .type("TRADEMARK")
                .assetId(s.getTrademark().getId())
                .title(s.getTrademark().getMark() != null ? s.getTrademark().getMark() : s.getTrademark().getTitle())
                .applicationNumber(s.getTrademark().getApplicationNumber())
                .status(s.getTrademark().getStatus())
                .jurisdiction(s.getTrademark().getJurisdiction())
                .filingDate(s.getTrademark().getFilingDate())
                .savedAt(s.getSavedAt())
                .build();
        throw new IllegalStateException("Either patent or trademark must be set");
    }

    private SavedIpAssetItemDTO toItem(Long userId, String type, Patent patent, Trademark trademark) {
        if (patent != null) {
            var savedAt = savedAssetRepository.findByUserIdAndPatentId(userId, patent.getId())
                .map(UserSavedIpAsset::getSavedAt).orElse(patent.getCreatedAt());
            return SavedIpAssetItemDTO.builder()
                .type("PATENT")
                .assetId(patent.getId())
                .title(patent.getTitle())
                .applicationNumber(patent.getApplicationNumber())
                .status(patent.getStatus())
                .jurisdiction(patent.getJurisdiction())
                .filingDate(patent.getFilingDate())
                .savedAt(savedAt)
                .build();
        }
        if (trademark != null) {
            var savedAt = savedAssetRepository.findByUserIdAndTrademarkId(userId, trademark.getId())
                .map(UserSavedIpAsset::getSavedAt).orElse(trademark.getCreatedAt());
            return SavedIpAssetItemDTO.builder()
                .type("TRADEMARK")
                .assetId(trademark.getId())
                .title(trademark.getMark() != null ? trademark.getMark() : trademark.getTitle())
                .applicationNumber(trademark.getApplicationNumber())
                .status(trademark.getStatus())
                .jurisdiction(trademark.getJurisdiction())
                .filingDate(trademark.getFilingDate())
                .savedAt(savedAt)
                .build();
        }
        throw new IllegalStateException("Either patent or trademark must be non-null");
    }
}
