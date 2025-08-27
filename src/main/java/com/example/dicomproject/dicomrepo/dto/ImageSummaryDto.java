package com.example.dicomproject.dicomrepo.dto;

public record ImageSummaryDto(
        Long studyKey,
        Long seriesKey,
        Long imageKey,
        String sopInstanceUid,
        String fname
) {}