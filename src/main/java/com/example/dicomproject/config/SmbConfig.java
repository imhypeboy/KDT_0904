package com.example.dicomproject.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component  // 간단히 컴포넌트로 등록 (또는 @EnableConfigurationProperties 사용)
@ConfigurationProperties(prefix = "smb")
public class SmbConfig {
    private String domain;
    private String username;
    private String password;
    private String basePath; // e.g. smb://210.94.241.9/sts/
}