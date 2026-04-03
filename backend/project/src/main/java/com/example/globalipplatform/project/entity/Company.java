package com.example.globalipplatform.project.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "companies")
public class Company {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String name;
    
    private String country;
    private String industry; // Healthcare, Technology, Automotive, etc.
    
    private Integer patentCount = 0;
    private Integer trademarkCount = 0;
    
    @Column(length = 2000)
    private String description;
    
    private String website;
    private Integer foundedYear;
    
    private Boolean isFortune500 = false;
    private Boolean isTechGiant = false;
    private Boolean isPharmaGiant = false;
}
