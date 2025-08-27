package com.example.dicomproject.userrepo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name="pacs_refresh_tokens")
@Getter
@Setter
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable=false)
    private UserAccount user;

    @Column(nullable=false, unique=true, length=512)
    private String token;

    @Column(nullable=false)
    private LocalDateTime expiresAt;

    @Column(nullable=false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
