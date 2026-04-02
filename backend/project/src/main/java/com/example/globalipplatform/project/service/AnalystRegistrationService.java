package com.example.globalipplatform.project.service;

import com.example.globalipplatform.project.DTO.*;
import com.example.globalipplatform.project.entity.AnalystRequest;
import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.repository.AnalystRequestRepository;
import com.example.globalipplatform.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AnalystRegistrationService {

    private final AnalystRequestRepository analystRequestRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public AnalystRegistrationService(
            AnalystRequestRepository analystRequestRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.analystRequestRepository = analystRequestRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public AnalystRequest submitRequest(AnalystRequestDTO requestDTO) throws IOException {
        // Validate inputs
        if (requestDTO.getFirstName() == null || requestDTO.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }
        if (requestDTO.getLastName() == null || requestDTO.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }
        if (requestDTO.getEmail() == null || requestDTO.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (requestDTO.getPassword() == null || requestDTO.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (requestDTO.getCredentialType() == null || requestDTO.getCredentialType().trim().isEmpty()) {
            throw new IllegalArgumentException("Credential type is required");
        }
        if (requestDTO.getCredentialNumber() == null || requestDTO.getCredentialNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Credential number is required");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(requestDTO.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        
        if (analystRequestRepository.existsByEmail(requestDTO.getEmail())) {
            throw new IllegalArgumentException("A request with this email is already pending");
        }

        AnalystRequest request = new AnalystRequest();
        request.setFirstName(requestDTO.getFirstName());
        request.setLastName(requestDTO.getLastName());
        request.setEmail(requestDTO.getEmail());
        request.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        request.setCredentialType(requestDTO.getCredentialType());
        request.setCredentialNumber(requestDTO.getCredentialNumber());
        request.setStatus(RequestStatus.PENDING);
        request.setSubmittedAt(LocalDateTime.now());

        // Save uploaded files
        String requestFolder = UUID.randomUUID().toString();
        
        if (requestDTO.getPatentAgentLicense() != null && !requestDTO.getPatentAgentLicense().isEmpty()) {
            String path = saveFile(requestDTO.getPatentAgentLicense(), requestFolder, "patent_license");
            request.setPatentAgentLicensePath(path);
        }
        
        if (requestDTO.getLawCouncilId() != null && !requestDTO.getLawCouncilId().isEmpty()) {
            String path = saveFile(requestDTO.getLawCouncilId(), requestFolder, "law_council");
            request.setLawCouncilIdPath(path);
        }
        
        if (requestDTO.getCompanyProof() != null && !requestDTO.getCompanyProof().isEmpty()) {
            String path = saveFile(requestDTO.getCompanyProof(), requestFolder, "company_proof");
            request.setCompanyProofPath(path);
        }
        
        if (requestDTO.getResearchInstitutionProof() != null && !requestDTO.getResearchInstitutionProof().isEmpty()) {
            String path = saveFile(requestDTO.getResearchInstitutionProof(), requestFolder, "research_proof");
            request.setResearchInstitutionProofPath(path);
        }

        AnalystRequest savedRequest = analystRequestRepository.save(request);
        
        // Send confirmation email with HTML template
        try {
            String htmlBody = "<!DOCTYPE html>" +
                "<html><body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>" +
                "<div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>" +
                "<div style='background-color: #2563eb; padding: 20px; text-align: center;'>" +
                "<h1 style='color: #ffffff; margin: 0;'>Global IP Intelligence</h1>" +
                "</div>" +
                "<div style='padding: 30px;'>" +
                "<h2 style='color: #1f2937;'>Analyst Registration Request Received</h2>" +
                "<p>Dear <strong>" + requestDTO.getFirstName() + "</strong>,</p>" +
                "<p>Thank you for submitting your request to become an Analyst on the Global IP Intelligence Platform.</p>" +
                "<div style='background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
                "<p><strong>Request ID:</strong> " + savedRequest.getId() + "</p>" +
                "<p><strong>Submitted:</strong> " + LocalDateTime.now() + "</p>" +
                "</div>" +
                "<p>Your application is now under review by our admin team. You will receive an email once a decision is made.</p>" +
                "<p>If you have any questions, please contact our support team.</p>" +
                "<br/>" +
                "<p>Best regards,<br/><strong>Global IP Intelligence Team</strong></p>" +
                "</div>" +
                "<div style='background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;'>" +
                "<p>&copy; 2026 Global IP Intelligence Platform. All rights reserved.</p>" +
                "</div>" +
                "</div></body></html>";
                
            emailService.sendEmail(requestDTO.getEmail(), "Analyst Registration Request Received", htmlBody);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }

        return savedRequest;
    }

    private String saveFile(MultipartFile file, String folder, String prefix) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, folder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = prefix + "_" + System.currentTimeMillis() + extension;
        
        // Save file
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);
        
        return folder + "/" + fileName;
    }

    public List<AnalystRequestResponseDTO> getPendingRequests() {
        List<AnalystRequest> requests = analystRequestRepository.findByStatusOrderBySubmittedAtDesc(RequestStatus.PENDING);
        return convertToDTO(requests);
    }

    public List<AnalystRequestResponseDTO> getAllRequests() {
        List<AnalystRequest> requests = analystRequestRepository.findAll();
        return convertToDTO(requests);
    }

    public AnalystRequestResponseDTO reviewRequest(ReviewRequestDTO reviewDTO, Long adminId) {
        AnalystRequest request = analystRequestRepository.findById(reviewDTO.getRequestId())
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setReviewedAt(LocalDateTime.now());
        request.setReviewedBy(adminId);
        request.setStatus(reviewDTO.isApproved() ? RequestStatus.APPROVED : RequestStatus.REJECTED);

        if (!reviewDTO.isApproved()) {
            request.setRejectionReason(reviewDTO.getRejectionReason());
            analystRequestRepository.save(request);
            
            // Send rejection email with HTML template
            try {
                String htmlBody = "<!DOCTYPE html>" +
                    "<html><body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>" +
                    "<div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>" +
                    "<div style='background-color: #dc2626; padding: 20px; text-align: center;'>" +
                    "<h1 style='color: #ffffff; margin: 0;'>Global IP Intelligence</h1>" +
                    "</div>" +
                    "<div style='padding: 30px;'>" +
                    "<h2 style='color: #1f2937;'>Analyst Registration Request Update</h2>" +
                    "<p>Dear <strong>" + request.getFirstName() + "</strong>,</p>" +
                    "<p>Thank you for your interest in becoming an Analyst on the Global IP Intelligence Platform.</p>" +
                    "<div style='background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;'>" +
                    "<p><strong>Status:</strong> REJECTED</p>" +
                    "<p><strong>Reason:</strong> " + reviewDTO.getRejectionReason() + "</p>" +
                    "</div>" +
                    "<p>If you believe this is an error or have additional documentation, please contact our support team.</p>" +
                    "<br/>" +
                    "<p>Best regards,<br/><strong>Global IP Intelligence Team</strong></p>" +
                    "</div>" +
                    "<div style='background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;'>" +
                    "<p>&copy; 2026 Global IP Intelligence Platform. All rights reserved.</p>" +
                    "</div>" +
                    "</div></body></html>";
                    
                emailService.sendEmail(request.getEmail(), "Analyst Registration Request Update", htmlBody);
            } catch (Exception e) {
                System.err.println("Failed to send email: " + e.getMessage());
            }
            
            return convertToDTO(request);
        }

        // Create user account for approved analyst
        User newAnalyst = new User();
        newAnalyst.setUsername(request.getFirstName() + " " + request.getLastName());
        newAnalyst.setEmail(request.getEmail());
        newAnalyst.setPassword(request.getPassword()); // Already encoded
        newAnalyst.setRole(Role.ANALYST);
        newAnalyst.setCreatedAt(LocalDateTime.now());
        
        userRepository.save(newAnalyst);
        request.setStatus(RequestStatus.APPROVED);
        analystRequestRepository.save(request);

        // Send approval email with HTML template and button
        try {
            String htmlBody = "<!DOCTYPE html>" +
                "<html><body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>" +
                "<div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>" +
                "<div style='background-color: #2563eb; padding: 20px; text-align: center;'>" +
                "<h1 style='color: #ffffff; margin: 0;'>Global IP Intelligence</h1>" +
                "</div>" +
                "<div style='padding: 30px;'>" +
                "<h2 style='color: #1f2937;'>Congratulations – Your Analyst Registration is Approved!</h2>" +
                "<p>Dear <strong>" + request.getFirstName() + "</strong>,</p>" +
                "<p>We are pleased to inform you that your request to become an Analyst on the Global IP Intelligence Platform has been <strong style='color: #10b981;'>APPROVED</strong>.</p>" +
                "<div style='background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;'>" +
                "<p><strong>Email:</strong> " + request.getEmail() + "</p>" +
                "<p><strong>Role:</strong> ANALYST</p>" +
                "<p>We look forward to your contributions to the platform!</p>" +
                "<br/>" +
                "<p>Best regards,<br/><strong>Global IP Intelligence Team</strong></p>" +
                "</div>" +
                "<div style='background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;'>" +
                "<p>&copy; 2026 Global IP Intelligence Platform. All rights reserved.</p>" +
                "</div>" +
                "</div></body></html>";
                
            emailService.sendEmail(request.getEmail(), "Analyst Registration Approved!", htmlBody);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }

        return convertToDTO(request);
    }

    private List<AnalystRequestResponseDTO> convertToDTO(List<AnalystRequest> requests) {
        List<AnalystRequestResponseDTO> dtos = new ArrayList<>();
        for (AnalystRequest request : requests) {
            dtos.add(convertToDTO(request));
        }
        return dtos;
    }

    private AnalystRequestResponseDTO convertToDTO(AnalystRequest request) {
        List<String> documents = new ArrayList<>();
        if (request.getPatentAgentLicensePath() != null) {
            documents.add("Patent Agent License");
        }
        if (request.getLawCouncilIdPath() != null) {
            documents.add("Law Council ID");
        }
        if (request.getCompanyProofPath() != null) {
            documents.add("Company Proof");
        }
        if (request.getResearchInstitutionProofPath() != null) {
            documents.add("Research Institution Proof");
        }

        return new AnalystRequestResponseDTO(
            request.getId(),
            request.getFirstName(),
            request.getLastName(),
            request.getEmail(),
            request.getCredentialType(),
            request.getCredentialNumber(),
            request.getStatus().toString(),
            request.getSubmittedAt(),
            documents,
            request.getPatentAgentLicensePath(),  
            request.getLawCouncilIdPath(),        
            request.getCompanyProofPath(),        
            request.getResearchInstitutionProofPath() 
        );
    }

    public long getPendingRequestsCount() {
    return analystRequestRepository.countByStatus(RequestStatus.PENDING);
}

public long getApprovedTodayCount() {
    return analystRequestRepository.countByStatusAndReviewedAtToday(RequestStatus.APPROVED.name());
}

public long getRejectedTodayCount() {
    return analystRequestRepository.countByStatusAndReviewedAtToday(RequestStatus.REJECTED.name());
}


}