package com.example.globalipplatform.project.repository;

import com.example.globalipplatform.project.entity.AnalystRequest;
import com.example.globalipplatform.project.DTO.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnalystRequestRepository extends JpaRepository<AnalystRequest, Long> {
    List<AnalystRequest> findByStatus(RequestStatus status);
    List<AnalystRequest> findByStatusOrderBySubmittedAtDesc(RequestStatus status);
    boolean existsByEmail(String email);
    
    // Count by status (JPQL works fine)
    @Query("SELECT COUNT(a) FROM AnalystRequest a WHERE a.status = :status")
    long countByStatus(@Param("status") RequestStatus status);
    
    // Use native query for date comparison
    @Query(value = "SELECT COUNT(*) FROM analyst_requests WHERE status = :status AND DATE(reviewed_at) = CURRENT_DATE", nativeQuery = true)
    long countByStatusAndReviewedAtToday(@Param("status") String status);
}