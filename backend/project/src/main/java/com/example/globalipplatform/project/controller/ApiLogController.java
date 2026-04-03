package com.example.globalipplatform.project.controller;

import com.example.globalipplatform.project.entity.ApiLog;
import com.example.globalipplatform.project.repository.ApiLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/logs")
public class ApiLogController {

    @Autowired
    private ApiLogRepository repo;

    @GetMapping
    public List<ApiLog> getLogs() {
        return repo.findAll();
    }
}