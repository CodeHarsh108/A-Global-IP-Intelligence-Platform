package com.example.globalipplatform.project.repository;

import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.entity.UserSearch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface UserSearchRepository extends JpaRepository<UserSearch, Long> {
    long countByUser(User user);
    List<UserSearch> findTop10ByUserOrderBySearchedAtDesc(User user);
}