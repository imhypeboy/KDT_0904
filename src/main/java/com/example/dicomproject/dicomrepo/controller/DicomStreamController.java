package com.example.dicomproject.dicomrepo.controller;


import com.example.dicomproject.config.SmbStorage;
import com.example.dicomproject.dicomrepo.service.DicomService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.*;

@RestController
@RequestMapping("/api/dicom")
@RequiredArgsConstructor
public class DicomStreamController {

    private final DicomService dicom;
    private final SmbStorage smb;

    @GetMapping("/instances/{sopUid}/file")
    public ResponseEntity<byte[]> streamDicom(
            @PathVariable String sopUid,
            HttpServletRequest request
    ) throws IOException {

        // 1) 메타에서 경로 구성
        var meta = dicom.getInstanceMeta(sopUid);
        String relativePath = meta.path() + meta.fname();

        // 2) 파일 크기
        long fileLength = smb.length(relativePath);

        // 3) Range 파싱
        String range = request.getHeader("Range"); // e.g. "bytes=0-1023"
        if (range == null) {
            // 전체 파일
            byte[] data = readAll(smb.open(relativePath), fileLength);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/dicom"))
                    .contentLength(fileLength)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .body(data);
        }

        // Partial
        long[] se = parseRange(range, fileLength);
        long start = se[0], end = se[1]; // inclusive
        long len = end - start + 1;

        try (InputStream in = smb.open(relativePath)) {
            in.skip(start);
            byte[] buf = readN(in, len);
            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .contentType(MediaType.parseMediaType("application/dicom"))
                    .contentLength(len)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + fileLength)
                    .body(buf);
        }
    }

    private static long[] parseRange(String header, long fileLen) {
        // "bytes=start-end" (end optional)
        String v = header.trim().toLowerCase().replace("bytes=", "");
        String[] p = v.split("-", 2);
        long start = Long.parseLong(p[0]);
        long end = (p.length > 1 && !p[1].isEmpty()) ? Long.parseLong(p[1]) : (fileLen - 1);
        if (end >= fileLen) end = fileLen - 1;
        if (start < 0 || start > end) throw new IllegalArgumentException("Invalid Range");
        return new long[]{start, end};
    }

    private static byte[] readAll(InputStream in, long size) throws IOException {
        try (in) {
            ByteArrayOutputStream out = new ByteArrayOutputStream((int) size);
            in.transferTo(out);
            return out.toByteArray();
        }
    }

    private static byte[] readN(InputStream in, long len) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream((int) len);
        byte[] buf = new byte[8192];
        long remaining = len;
        while (remaining > 0) {
            int toRead = (int) Math.min(buf.length, remaining);
            int r = in.read(buf, 0, toRead);
            if (r == -1) break;
            out.write(buf, 0, r);
            remaining -= r;
        }
        return out.toByteArray();
    }
}