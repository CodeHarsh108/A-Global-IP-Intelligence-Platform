package com.example.globalipplatform.project.repository;

import com.example.globalipplatform.project.entity.UserSavedIpAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSavedIpAssetRepository extends JpaRepository<UserSavedIpAsset, Long> {

    List<UserSavedIpAsset> findAllByUserIdOrderBySavedAtDesc(Long userId);

    Optional<UserSavedIpAsset> findByUserIdAndPatentId(Long userId, Long patentId);

    Optional<UserSavedIpAsset> findByUserIdAndTrademarkId(Long userId, Long trademarkId);

    boolean existsByUserIdAndPatentId(Long userId, Long patentId);

    boolean existsByUserIdAndTrademarkId(Long userId, Long trademarkId);

    void deleteByUserIdAndPatentId(Long userId, Long patentId);

    void deleteByUserIdAndTrademarkId(Long userId, Long trademarkId);
}
