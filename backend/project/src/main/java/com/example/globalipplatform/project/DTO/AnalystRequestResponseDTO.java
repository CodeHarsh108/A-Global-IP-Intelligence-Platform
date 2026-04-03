package com.example.globalipplatform.project.DTO;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalystRequestResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String credentialType;
    private String credentialNumber;
    private String status;
    private LocalDateTime submittedAt;
    private List<String> documents; 

    private String patentAgentLicensePath;
    private String lawCouncilIdPath;
    private String companyProofPath;
    private String researchInstitutionProofPath;
}
