package com.example.globalipplatform.project.DTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class PatentSearchResponse {
    private List<PatentDTO> patents;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
}