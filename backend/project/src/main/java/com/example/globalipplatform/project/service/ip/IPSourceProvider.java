package com.example.globalipplatform.project.service.ip;

import com.example.globalipplatform.project.DTO.IPDataDTO;
import java.util.List;

public interface IPSourceProvider {
    String getSourceName();

    List<IPDataDTO> search(String query);
}
