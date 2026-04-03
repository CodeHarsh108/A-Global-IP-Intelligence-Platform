package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.entity.AnalystRequest;
import com.example.globalipplatform.project.repository.AnalystRequestRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final AnalystRequestRepository analystRequestRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public FileController(AnalystRequestRepository analystRequestRepository) {
        this.analystRequestRepository = analystRequestRepository;
    }

    @GetMapping("/view/{requestId}/{documentType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> viewDocument(
            @PathVariable Long requestId,
            @PathVariable String documentType) {
        
        try {
            AnalystRequest request = analystRequestRepository.findById(requestId)
                    .orElseThrow(() -> new RuntimeException("Request not found"));

            String filePath = null;
            switch (documentType) {
                case "patentAgentLicense":
                    filePath = request.getPatentAgentLicensePath();
                    break;
                case "lawCouncilId":
                    filePath = request.getLawCouncilIdPath();
                    break;
                case "companyProof":
                    filePath = request.getCompanyProofPath();
                    break;
                case "researchInstitutionProof":
                    filePath = request.getResearchInstitutionProofPath();
                    break;
                default:
                    return ResponseEntity.notFound().build();
            }

            if (filePath == null) {
                return ResponseEntity.notFound().build();
            }

            Path path = Paths.get(uploadDir).resolve(filePath);
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(filePath);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/download/{requestId}/{documentType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long requestId,
            @PathVariable String documentType) {
        
        try {
            AnalystRequest request = analystRequestRepository.findById(requestId)
                    .orElseThrow(() -> new RuntimeException("Request not found"));

            String filePath = null;
            switch (documentType) {
                case "patentAgentLicense":
                    filePath = request.getPatentAgentLicensePath();
                    break;
                case "lawCouncilId":
                    filePath = request.getLawCouncilIdPath();
                    break;
                case "companyProof":
                    filePath = request.getCompanyProofPath();
                    break;
                case "researchInstitutionProof":
                    filePath = request.getResearchInstitutionProofPath();
                    break;
                default:
                    return ResponseEntity.notFound().build();
            }

            if (filePath == null) {
                return ResponseEntity.notFound().build();
            }

            Path path = Paths.get(uploadDir).resolve(filePath);
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(filePath);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String determineContentType(String filename) {
        if (filename.endsWith(".pdf")) {
            return "application/pdf";
        } else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (filename.endsWith(".png")) {
            return "image/png";
        } else if (filename.endsWith(".doc")) {
            return "application/msword";
        } else if (filename.endsWith(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else {
            return "application/octet-stream";
        }
    }
}