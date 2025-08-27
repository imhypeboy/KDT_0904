package com.example.dicomproject.userrepo.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long   expiresInSec,
        String username,
        String displayName
) {}
