package com.example.dicomproject.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "cors")
@Data
public class CorsProps {
    private List<String> allowedOrigins = List.of("http://localhost:3000");
}