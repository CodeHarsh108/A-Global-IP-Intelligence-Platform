package com.example.globalipplatform.project.DTO;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PatentDTO {
    private Long id;
    private String assetNumber;
    private String title;
    private String description;
    private String abstractText;
    private String jurisdiction;
    private LocalDateTime filingDate;
    private LocalDateTime publicationDate;
    private LocalDateTime grantDate;
    private String status;
    private String assignee;
    private String assigneeCountry;
    private String inventors;
    private String ipcClasses;
    private String cpcClasses;
    private String legalStatus;
    private Boolean annualFeePaid;
    private LocalDateTime nextFeeDate;
    private String technology;
    private Integer citationCount;
    private String claims;
    private String citedPatents;
    private Integer claimCount;
    private Integer drawingCount;
    private String patentType;
    private String applicationNumber;
    private String examiner;
    private Boolean isCorePatent;
}