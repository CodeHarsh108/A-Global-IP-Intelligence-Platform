package com.example.globalipplatform.project.DTO;
import lombok.Data;

@Data
public class TrademarkSearchRequest {
    private String query;
    private String jurisdiction;
    private String status;
    private String owner;
    private String niceClass;
    private Integer yearFrom;
    private Integer yearTo;
    private String sortBy;
    private String sortOrder;
}