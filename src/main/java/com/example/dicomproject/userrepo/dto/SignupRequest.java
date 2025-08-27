package com.example.dicomproject.userrepo.dto;

public record SignupRequest(
        String username,
        String password,
        String displayName
) {}