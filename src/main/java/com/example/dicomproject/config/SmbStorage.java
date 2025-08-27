package com.example.dicomproject.config;

import jcifs.CIFSContext;
import jcifs.context.SingletonContext;
import jcifs.smb.NtlmPasswordAuthenticator;
import jcifs.smb.SmbFile;
import jcifs.smb.SmbFileInputStream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;


@Component
@RequiredArgsConstructor
public class SmbStorage {

    private final SmbConfig config;

    private CIFSContext ctx() {
        var domain = config.getDomain() == null ? "" : config.getDomain();
        return SingletonContext.getInstance()
                .withCredentials(new NtlmPasswordAuthenticator(domain, config.getUsername(), config.getPassword()));
    }

    public InputStream open(String relativePath) throws IOException {
        String url = normalize(config.getBasePath(), relativePath);
        SmbFile file = new SmbFile(url, ctx());
        return new SmbFileInputStream(file);
    }

    public long length(String relativePath) throws IOException {
        SmbFile file = new SmbFile(normalize(config.getBasePath(), relativePath), ctx());
        return file.length();
    }

    private String normalize(String base, String rel) {
        String r = rel.replace('\\', '/');
        if (r.startsWith("/")) r = r.substring(1);
        if (!base.endsWith("/")) base = base + "/";
        return base + r;
    }
}