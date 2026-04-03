package com.example.globalipplatform.project.repository;

import com.example.globalipplatform.project.DTO.Role;
import com.example.globalipplatform.project.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
long countByRole(Role role);

}
