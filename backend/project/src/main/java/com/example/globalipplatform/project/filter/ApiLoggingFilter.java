package com.example.globalipplatform.project.filter;

import com.example.globalipplatform.project.entity.ApiLog;
import com.example.globalipplatform.project.repository.ApiLogRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class ApiLoggingFilter extends OncePerRequestFilter {

    @Autowired
    private ApiLogRepository repo;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain)
            throws ServletException, IOException {

        // continue request
        filterChain.doFilter(request, response);

        // debug print
        System.out.println("API HIT: " + request.getRequestURI());

        // save log
        ApiLog log = new ApiLog();
        log.setEndpoint(request.getRequestURI());
        log.setMethod(request.getMethod());
        log.setStatusCode(response.getStatus());
        log.setTimestamp(LocalDateTime.now());

        repo.save(log);
    }
}