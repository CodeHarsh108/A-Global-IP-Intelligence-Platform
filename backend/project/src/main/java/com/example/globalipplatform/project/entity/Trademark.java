package com.example.globalipplatform.project.entity;


import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "trademarks", indexes = {
    @Index(name = "idx_trademark_number", columnList = "assetNumber"),
    @Index(name = "idx_trademark_mark", columnList = "title"),
    @Index(name = "idx_trademark_owner", columnList = "assignee")
})
public class Trademark extends IpAsset {
    
    private String mark; // The actual trademark text/logo description
    private String markType; // WORD, FIGURATIVE, WORD_FIGURATIVE, 3D, etc.
    
    private String niceClasses; // Comma-separated Nice Classification numbers
    
    @Column(length = 2000)
    private String goodsServices; // Description of goods/services
    
    private String registrationNumber;
    private String applicationNumber;
    
    private Boolean isLogo;
    private String colorClaim;
    
    private String oppositionPeriod;
    private String renewalDate;
    
    private Boolean isCoreTrademark = false; // From static dataset

     @OneToMany(mappedBy = "trademark", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Subscription> subscriptions;
    
    @OneToMany(mappedBy = "trademark", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Notification> notifications;
    
    @OneToMany(mappedBy = "trademark", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Filings> filings;
}
