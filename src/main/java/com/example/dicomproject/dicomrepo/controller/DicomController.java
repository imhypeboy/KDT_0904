package com.example.dicomproject.dicomrepo.controller;

import com.example.dicomproject.config.SmbStorage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
/*

@RestController
@RequestMapping("/api/dicom")  // ✅ 통일된 prefix
@RequiredArgsConstructor
public class DicomController {

    private final SmbStorage smbStorage;


    @GetMapping("/file")
    public ResponseEntity<InputStreamResource> getDicomFile(@RequestParam String path) throws IOException {
        var inputStream = smbStorage.readFile(path);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/dicom"));
        headers.setContentDisposition(ContentDisposition.inline().filename(path).build());

        return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(inputStream));
    }
}

*/