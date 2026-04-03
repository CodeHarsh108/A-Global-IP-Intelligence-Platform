package com.example.globalipplatform.project.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@MappedSuperclass
public abstract class IpAsset {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(length = 255)
    private String assetNumber;
    
    @Column(length = 500)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @Column(length = 100)
    private String jurisdiction;
    
    private LocalDateTime filingDate;
    private LocalDateTime publicationDate;
    private LocalDateTime grantDate;
    
    @Column(length = 50)
    private String status;
    
    @Column(length = 5000)
    private String abstractText;
    
    @Column(length = 255)
    private String assignee;
    
    @Column(length = 100)
    private String assigneeCountry;
    
    @Column(length = 1000)
    private String ipcClasses;
    
    @Column(length = 1000)
    private String cpcClasses;
    
    @Column(length = 100)
    private String legalStatus;
    
    private Boolean annualFeePaid;
    private LocalDateTime nextFeeDate;
    
    @Column(length = 100)
    private String technology;
    
    private Integer citationCount;
    
    @Column(length = 255)
    private String familyId;
    
    private String imageUrl; // URL to image/logo
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}