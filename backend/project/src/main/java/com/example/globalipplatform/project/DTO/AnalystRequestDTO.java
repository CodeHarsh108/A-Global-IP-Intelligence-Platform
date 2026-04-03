package com.example.globalipplatform.project.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalystRequestDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String credentialType;
    private String credentialNumber;
    
    // Files
    private MultipartFile patentAgentLicense;
    private MultipartFile lawCouncilId;
    private MultipartFile companyProof;
    private MultipartFile researchInstitutionProof;
}
