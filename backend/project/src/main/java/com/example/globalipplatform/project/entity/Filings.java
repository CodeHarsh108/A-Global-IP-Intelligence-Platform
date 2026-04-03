package com.example.globalipplatform.project.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name="filings")
public class Filings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patent_id", nullable = true)
    @JsonIgnore
    private Patent patent;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trademark_id", nullable = true)
    @JsonIgnore
    private Trademark trademark;

    @Transient
    public String getAssetType() {
        if (patent != null) return "PATENT";
        if (trademark != null) return "TRADEMARK";
        return null;
    }

   private LocalDateTime date=LocalDateTime.now();

    private String status;
    private String description;
}
