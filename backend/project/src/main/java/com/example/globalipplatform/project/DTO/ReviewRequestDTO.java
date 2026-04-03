package com.example.globalipplatform.project.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequestDTO {
    private Long requestId;
    private boolean approved;
    private String rejectionReason; // Required if rejected
}
