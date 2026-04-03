package com.example.globalipplatform.project.AdminDashboard;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/Admin")
public class Admin_Dashboard {


    @GetMapping("/Dashboard")
    public String Testing(){

        return "Hey this is Admin Dashboard";
    }
}
