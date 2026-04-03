package com.example.globalipplatform.project.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class TopCitedDTO {
    private Long patentId;
    private String title;
    private int citationCount;
}