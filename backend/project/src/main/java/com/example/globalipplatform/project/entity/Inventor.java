package com.example.globalipplatform.project.entity;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "inventors")
public class Inventor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String firstName;
    private String lastName;
    private String fullName;
    private String country;
    private String city;
    
    private Integer patentCount = 0;
    private String topTechnology;
    
    @Column(length = 1000)
    private String companies; // Companies they've worked for/assigned to
    
    private Boolean isActive = true;
}
