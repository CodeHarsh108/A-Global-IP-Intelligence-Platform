package com.example.globalipplatform.project.repository;

import com.example.globalipplatform.project.entity.Patent;
import com.example.globalipplatform.project.entity.Subscription;
import com.example.globalipplatform.project.entity.Trademark;
import com.example.globalipplatform.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByUser(User user);

    Optional<Subscription> findByUserAndPatent(User user, Patent patent);

    Optional<Subscription> findByUserAndTrademark(User user, Trademark trademark);

    boolean existsByUserAndPatent(User user, Patent patent);

    boolean existsByUserAndTrademark(User user, Trademark trademark);

    List<Subscription> findByPatent(Patent patent);

    List<Subscription> findByTrademark(Trademark trademark);
}

