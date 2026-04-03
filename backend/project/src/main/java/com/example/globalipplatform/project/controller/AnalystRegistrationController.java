package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.DTO.AnalystRequestDTO;
import com.example.globalipplatform.project.entity.AnalystRequest;
import com.example.globalipplatform.project.service.AnalystRegistrationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analyst-registration")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalystRegistrationController {

    private final AnalystRegistrationService registrationService;

    public AnalystRegistrationController(AnalystRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping(value = "/submit", consumes = {"multipart/form-data"})
    public ResponseEntity<?> submitRequest(
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("credentialType") String credentialType,
            @RequestParam("credentialNumber") String credentialNumber,
            @RequestParam(value = "patentAgentLicense", required = false) MultipartFile patentAgentLicense,
            @RequestParam(value = "lawCouncilId", required = false) MultipartFile lawCouncilId,
            @RequestParam(value = "companyProof", required = false) MultipartFile companyProof,
            @RequestParam(value = "researchInstitutionProof", required = false) MultipartFile researchInstitutionProof) {
        
        try {
            System.out.println("=== Analyst Registration Request Received ===");
            System.out.println("Name: " + firstName + " " + lastName);
            System.out.println("Email: " + email);
            System.out.println("Credential Type: " + credentialType);
            System.out.println("Credential Number: " + credentialNumber);
            
            // Create DTO manually
            AnalystRequestDTO requestDTO = new AnalystRequestDTO();
            requestDTO.setFirstName(firstName);
            requestDTO.setLastName(lastName);
            requestDTO.setEmail(email);
            requestDTO.setPassword(password);
            requestDTO.setCredentialType(credentialType);
            requestDTO.setCredentialNumber(credentialNumber);
            requestDTO.setPatentAgentLicense(patentAgentLicense);
            requestDTO.setLawCouncilId(lawCouncilId);
            requestDTO.setCompanyProof(companyProof);
            requestDTO.setResearchInstitutionProof(researchInstitutionProof);

            AnalystRequest request = registrationService.submitRequest(requestDTO);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Request submitted successfully. You will be notified via email once reviewed.");
            response.put("requestId", request.getId().toString());
            
            System.out.println("Request saved with ID: " + request.getId());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            System.err.println("Validation error: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            System.err.println("Server error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error submitting request: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
