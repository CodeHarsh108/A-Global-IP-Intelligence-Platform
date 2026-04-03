package com.example.globalipplatform.project.DTO;

import lombok.Data;

@Data
public class PatentSearchRequest {
    private String query = "";
    private String jurisdiction;
    private String status;
    private String assignee;
    private String inventor;
    private String technology;
    private Integer yearFrom;
    private Integer yearTo;
    private String sortBy; // filingDate, grantDate, citationCount
    private String sortOrder; // asc, desc
}