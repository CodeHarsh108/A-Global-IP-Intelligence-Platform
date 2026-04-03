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

@Table(name="notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patent_id", nullable = true)
    @JsonIgnore
    private Patent patent;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trademark_id", nullable = true)
    @JsonIgnore
    private Trademark trademark;

    private String message;

    private String type;

    private LocalDateTime timestamp=LocalDateTime.now();
}
