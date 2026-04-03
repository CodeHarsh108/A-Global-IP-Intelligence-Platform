package com.example.globalipplatform.project.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class FilingTrendDTO {
    private int year;
    private long patentCount;
    private long trademarkCount;
}