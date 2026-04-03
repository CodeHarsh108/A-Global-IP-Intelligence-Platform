package com.example.globalipplatform.project.service.ip;

import com.example.globalipplatform.project.DTO.IPDataDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class IPSearchService {

    private final List<IPSourceProvider> providers;

    public IPSearchService(List<IPSourceProvider> providers) {
        this.providers = providers;
    }

    public List<IPDataDTO> search(String query, String source) {
        // If specific source requested
        if (source != null && !source.isEmpty() && !"ALL".equalsIgnoreCase(source)) {
            return providers.stream()
                    .filter(p -> p.getSourceName().equalsIgnoreCase(source))
                    .findFirst()
                    .map(p -> p.search(query))
                    .orElse(new ArrayList<>());
        }

        // Parallel search across all providers
        List<CompletableFuture<List<IPDataDTO>>> futures = providers.stream()
                .map(p -> CompletableFuture.supplyAsync(() -> p.search(query)))
                .collect(Collectors.toList());

        return futures.stream()
                .map(CompletableFuture::join)
                .flatMap(List::stream)
                .collect(Collectors.toList());
    }
}
