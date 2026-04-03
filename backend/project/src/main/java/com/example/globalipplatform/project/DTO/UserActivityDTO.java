package com.example.globalipplatform.project.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserActivityDTO {
    private String type; // "SEARCH", "SAVED", "SUBSCRIBED"
    private String title;
    private String description;
    private LocalDateTime timestamp;
}