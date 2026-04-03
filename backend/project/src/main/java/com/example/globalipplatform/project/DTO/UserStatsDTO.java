package com.example.globalipplatform.project.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {
    private long totalSearches;
    private long savedAssets;
    private long activeSubscriptions;
}