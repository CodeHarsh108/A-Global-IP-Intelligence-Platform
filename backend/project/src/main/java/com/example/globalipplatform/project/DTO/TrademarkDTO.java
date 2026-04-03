package com.example.globalipplatform.project.DTO;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TrademarkDTO {
    private Long id;
    private String assetNumber;
    private String mark;
    private String title;
    private String description;
    private String jurisdiction;
    private LocalDateTime filingDate;
    private String status;
    private String assignee;
    private String markType;
    private String niceClasses;
    private String goodsServices;
    private String registrationNumber;
    private String applicationNumber;
    private String imageUrl;
    private Boolean isLogo;
    private String colorClaim;
    private String renewalDate; // String in entity — kept as String here
    private Boolean isCoreTrademark;
}