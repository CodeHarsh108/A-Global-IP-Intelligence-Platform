package com.example.globalipplatform.project.repository;

import com.example.globalipplatform.project.entity.Patent;
import com.example.globalipplatform.project.entity.Subscription;
import com.example.globalipplatform.project.entity.Trademark;
import com.example.globalipplatform.project.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    @Query("SELECT s FROM Subscription s LEFT JOIN FETCH s.patent LEFT JOIN FETCH s.trademark WHERE s.user = :user")
    List<Subscription> findByUserWithAssets(@Param("user") User user);

    List<Subscription> findByUser(User user);

    Optional<Subscription> findByUserAndPatent(User user, Patent patent);

    Optional<Subscription> findByUserAndTrademark(User user, Trademark trademark);

    boolean existsByUserAndPatent(User user, Patent patent);

    boolean existsByUserAndTrademark(User user, Trademark trademark);

    List<Subscription> findByPatent(Patent patent);

    List<Subscription> findByTrademark(Trademark trademark);

    long countByUser(User user);

    @Query("SELECT s FROM Subscription s WHERE s.user = :user ORDER BY s.created_at DESC")
    List<Subscription> findTop10ByUserOrderByCreatedAtDesc(@Param("user") User user, Pageable pageable);
}