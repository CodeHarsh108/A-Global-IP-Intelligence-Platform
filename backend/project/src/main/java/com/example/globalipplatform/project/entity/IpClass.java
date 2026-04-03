package com.example.globalipplatform.project.entity;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "ip_classes")
public class IpClass {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String code; 
    
    private String type; 
    
    private String section;
    private String sectionName;
    
    @Column(name = "class_code")
    private String classCode;
    private String className;
    
    private String subclass;
    private String subclassName;
    
    @Column(name = "group_code")
    private String groupCode;
    private String groupName;
    
    private String description;
    
    private Integer patentCount = 0;
}
