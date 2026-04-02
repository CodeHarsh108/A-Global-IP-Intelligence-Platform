package com.example.globalipplatform.project.filter;

import com.example.globalipplatform.project.config.JWTService;
import com.example.globalipplatform.project.entity.ApiLog;
import com.example.globalipplatform.project.repository.ApiLogRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class ApiLoggingFilter extends OncePerRequestFilter {

    private final ApiLogRepository apiLogRepository;
    private final JWTService jwtService;

    public ApiLoggingFilter(ApiLogRepository apiLogRepository, JWTService jwtService) {
        this.apiLogRepository = apiLogRepository;
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();
        filterChain.doFilter(wrappedRequest, wrappedResponse);
        long duration = System.currentTimeMillis() - startTime;

        // Extract username from JWT token
        String username = null;
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                username = jwtService.extractUsername(token);
            } catch (Exception e) {
                // token invalid or expired
            }
        }
        if (username == null && SecurityContextHolder.getContext().getAuthentication() != null) {
            username = SecurityContextHolder.getContext().getAuthentication().getName();
        }
        if (username == null) {
            username = "Anonymous";
        }

        ApiLog log = new ApiLog();
        log.setEndpoint(request.getRequestURI());
        log.setMethod(request.getMethod());
        log.setStatusCode(wrappedResponse.getStatus());
        log.setTimestamp(LocalDateTime.now());
        log.setUserName(username);
        apiLogRepository.save(log);

        wrappedResponse.copyBodyToResponse();
    }
}