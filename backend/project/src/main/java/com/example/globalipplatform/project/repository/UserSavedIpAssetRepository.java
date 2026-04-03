package com.example.globalipplatform.project.repository;

import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.entity.UserSavedIpAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    long countByUser(User user);

    @Query(value = "SELECT * FROM user_saved_ip_assets WHERE user_id = :userId ORDER BY saved_at DESC LIMIT 10", nativeQuery = true)
    List<UserSavedIpAsset> findTop10ByUserOrderBySavedAtDesc(@Param("userId") Long userId);
}