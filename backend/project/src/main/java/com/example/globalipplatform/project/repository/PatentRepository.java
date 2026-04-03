package com.example.globalipplatform.project.repository;

import com.example.globalipplatform.project.entity.Patent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatentRepository extends JpaRepository<Patent, Long> {
    
    Patent findByAssetNumber(String assetNumber);
    
    @Query(value = "SELECT p FROM Patent p WHERE " +
           "(:query IS NULL OR " +
           "   LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "   LOWER(p.abstractText) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "   LOWER(p.assignee) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "   LOWER(p.inventors) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Patent> searchPatentsSimple(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT DISTINCT p.technology FROM Patent p WHERE p.technology IS NOT NULL")
    List<String> findAllTechnologies();
    
    @Query("SELECT DISTINCT p.jurisdiction FROM Patent p")
    List<String> findAllJurisdictions();
    
    @Query("SELECT DISTINCT p.status FROM Patent p")
    List<String> findAllStatuses();
    
    long countByIsCorePatentTrue();

@Query("SELECT YEAR(p.filingDate) as year, COUNT(p) FROM Patent p GROUP BY YEAR(p.filingDate) ORDER BY year")
List<Object[]> countPatentsByFilingYear();

@Query("SELECT p.id, p.title, p.citationCount FROM Patent p WHERE p.citationCount > 0 ORDER BY p.citationCount DESC LIMIT :limit")
List<Object[]> findTopCitedPatents(@Param("limit") int limit);

@Query("SELECT p.familyId, COUNT(p) FROM Patent p WHERE p.familyId IS NOT NULL GROUP BY p.familyId ORDER BY COUNT(p) DESC")
List<Object[]> countByFamilyId();

@Query("SELECT p.technology, COUNT(p) FROM Patent p WHERE p.technology IS NOT NULL GROUP BY p.technology ORDER BY COUNT(p) DESC")
List<Object[]> countByTechnology();
}