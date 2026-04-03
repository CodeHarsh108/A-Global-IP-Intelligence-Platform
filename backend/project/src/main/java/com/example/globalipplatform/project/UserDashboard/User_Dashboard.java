package com.example.globalipplatform.project.UserDashboard;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/Users")
public class User_Dashboard {


    @GetMapping("/Dashboard")
    public String getDetails(){
        return "This is the Users Dashboard";
    }
}
