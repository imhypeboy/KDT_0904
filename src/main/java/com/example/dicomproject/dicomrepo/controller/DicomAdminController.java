package com.example.dicomproject.dicomrepo.controller;


import com.example.dicomproject.config.SmbStorage;
import com.example.dicomproject.dicomrepo.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;

@RestController
@RequestMapping("/api/dicom")
@RequiredArgsConstructor
public class DicomAdminController {

    private final StudyRepository studyRepo;
    private final SmbStorage smb;

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        try {
            long studyCount = studyRepo.count(); // Oracle 연결 확인
            // SMB는 basePath 루트 파일 하나 시도 (권한만 확인)
            try (InputStream ignored = smb.open("")) { /* 일부 NAS는 디렉터리 open 불가 → 무시 */ }
            return ResponseEntity.ok().body(
                    java.util.Map.of("oracle","ok","smb","ok","studyCount",studyCount)
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    java.util.Map.of("oracle","fail/smb maybe fail","error", e.getMessage())
            );
        }
    }
}