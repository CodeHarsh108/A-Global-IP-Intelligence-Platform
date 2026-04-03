package com.example.globalipplatform.project.entity;

import com.example.globalipplatform.project.DTO.RequestStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "analyst_requests")
public class AnalystRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Personal Information
    private String firstName;
    private String lastName;
    private String email;
    private String password; // Will be stored encrypted
    
    // Professional Information
    private String credentialType; // PATENT_AGENT, LAW_COUNCIL, COMPANY, RESEARCH_INSTITUTION
    private String credentialNumber;
    
    // File paths for uploaded documents
    private String patentAgentLicensePath;
    private String lawCouncilIdPath;
    private String companyProofPath;
    private String researchInstitutionProofPath;
    
    // Status and metadata
    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;
    
    private LocalDateTime submittedAt = LocalDateTime.now();
    private LocalDateTime reviewedAt;
    
    // Admin who reviewed this request
    private Long reviewedBy;
    private String rejectionReason;
}

