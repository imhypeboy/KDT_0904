package com.example.dicomproject.userrepo.dto;

public record LoginRequest(
        String username,
        String password
) {}