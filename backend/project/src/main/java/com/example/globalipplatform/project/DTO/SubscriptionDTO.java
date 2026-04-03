package com.example.globalipplatform.project.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionDTO {
    private Long id;
    private LocalDateTime created_at;
    private String assetType;
    private Long assetId;
    private String title;
    private String assetNumber;
    private String jurisdiction;
    private String status;
}