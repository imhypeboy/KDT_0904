package com.example.dicomproject.dicomrepo.dto;

public record SeriesSummaryDto(
        Long studyKey,
        Long seriesKey,
        String seriesInstanceUid,
        String modality,
        String bodyPart,
        Integer imageCount
) {}