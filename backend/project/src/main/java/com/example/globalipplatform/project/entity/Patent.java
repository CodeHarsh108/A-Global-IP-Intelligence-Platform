package com.example.globalipplatform.project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "patents")
public class Patent extends IpAsset {
    
    @Column(length = 5000)
    private String claims;
    
    @Column(length = 5000)
    private String citedPatents;
    
    @Column(length = 5000)
    private String inventors;
    
    private Integer claimCount;
    private Integer drawingCount;
    
    @Column(length = 50)
    private String patentType;
    
    @Column(length = 255)
    private String applicationNumber;
    
    @Column(length = 255)
    private String publicationNumber;
    
    @Column(length = 255)
    private String grantNumber;
    
    @Column(length = 255)
    private String examiner;
    
    private Boolean isCorePatent = false;
    
    @OneToMany(mappedBy = "patent", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Subscription> subscriptions;
    
    @OneToMany(mappedBy = "patent", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Notification> notifications;
    
    @OneToMany(mappedBy = "patent", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Filings> filings;
}