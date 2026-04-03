package com.example.globalipplatform.project.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class TrademarkSearchResponse {
    private List<TrademarkDTO> trademarks;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
}