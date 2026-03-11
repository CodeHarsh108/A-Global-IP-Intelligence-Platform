package com.example.globalipplatform.project.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class TechnologyDistributionDTO {
    private String technology;
    private long count;
}