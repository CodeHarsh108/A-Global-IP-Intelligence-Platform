package com.example.globalipplatform.project.repository;

import com.example.globalipplatform.project.entity.Trademark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrademarkRepository extends JpaRepository<Trademark, Long> {

        Trademark findByAssetNumber(String assetNumber);

        @Query("SELECT DISTINCT t.jurisdiction FROM Trademark t WHERE t.jurisdiction IS NOT NULL")
        List<String> findAllJurisdictions();

        @Query("SELECT DISTINCT t.status FROM Trademark t WHERE t.status IS NOT NULL")
        List<String> findAllStatuses();

@Query("SELECT YEAR(t.filingDate) as year, COUNT(t) FROM Trademark t GROUP BY YEAR(t.filingDate) ORDER BY year")
List<Object[]> countTrademarksByFilingYear();
}