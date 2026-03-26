package com.example.globalipplatform.project.repository;

import com.example.globalipplatform.project.entity.Filings;
import com.example.globalipplatform.project.entity.Patent;
import com.example.globalipplatform.project.entity.Trademark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FilingsRepository extends JpaRepository<Filings, Long> {

    List<Filings> findByPatentOrderByDateAsc(Patent patent);

    List<Filings> findByTrademarkOrderByDateAsc(Trademark trademark);
}