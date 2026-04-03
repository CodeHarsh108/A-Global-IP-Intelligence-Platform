package com.example.globalipplatform.project.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IPDataDTO {
    private String id;
    private String title;
    private String description;
    private String applicationNumber;
    private String applicant;
    private LocalDate applicationDate;
    private String status;
    private String source; // WIPO, USPTO, EPO, TMView
    private String type; // PATENT, TRADEMARK
    private String detailUrl;
}
