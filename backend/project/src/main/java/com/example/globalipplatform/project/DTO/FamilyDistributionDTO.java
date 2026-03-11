package com.example.globalipplatform.project.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class FamilyDistributionDTO {
    private String familyId;
    private long memberCount;
}