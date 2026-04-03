package com.example.globalipplatform.project.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name="subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch=FetchType.LAZY)
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

    private LocalDateTime created_at= LocalDateTime.now();
}
