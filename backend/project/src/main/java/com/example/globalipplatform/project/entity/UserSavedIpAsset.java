package com.example.globalipplatform.project.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Links a user to a saved IP asset (patent or trademark) for "My IP Assets" storage and display.
 */
@Entity
@Table(name = "user_saved_ip_assets", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "user_id", "patent_id" }),
    @UniqueConstraint(columnNames = { "user_id", "trademark_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSavedIpAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patent_id")
    private Patent patent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trademark_id")
    private Trademark trademark;

    private LocalDateTime savedAt = LocalDateTime.now();

    /** Exactly one of patent or trademark must be set. */
    public boolean isValid() {
        return (patent != null && trademark == null) || (patent == null && trademark != null);
    }
}
