package com.example.globalipplatform.project.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_searches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSearch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String query;
    private String filters; // JSON or simple string of applied filters
    private Integer resultCount;
    private LocalDateTime searchedAt = LocalDateTime.now();
}