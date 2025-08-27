package com.example.dicomproject.dicomrepo.dto;

public record StudySummaryDto(
        Long studyKey,
        String studyInstanceUid,
        String pid,
        String pname,
        String accessionNumber,
        String studyDate,
        String modality,
        Integer seriesCount,
        Integer imageCount
) {}