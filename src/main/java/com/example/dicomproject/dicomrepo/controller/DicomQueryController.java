package com.example.dicomproject.dicomrepo.controller;


import com.example.dicomproject.dicomrepo.dto.*;
import com.example.dicomproject.dicomrepo.service.DicomService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dicom")
@RequiredArgsConstructor
public class DicomQueryController {

    private final DicomService dicom;

    @GetMapping("/studies")
    public List<StudySummaryDto> searchStudies(
            @RequestParam(required = false) String pid,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String modality
    ) {
        return dicom.searchStudies(pid, fromDate, toDate, modality);
    }

    @GetMapping("/studies/{studyUid}")
    public StudyDetailDto studyDetail(@PathVariable String studyUid) {
        return dicom.getStudy(studyUid);
    }

    @GetMapping("/studies/{studyUid}/series")
    public List<SeriesSummaryDto> listSeries(@PathVariable String studyUid) {
        return dicom.listSeries(studyUid);
    }

    @GetMapping("/series/{seriesUid}/instances")
    public List<ImageSummaryDto> listInstances(@PathVariable String seriesUid) {
        return dicom.listInstances(seriesUid);
    }

    @GetMapping("/instances/{sopUid}/meta")
    public ImageMetaDto getInstanceMeta(@PathVariable String sopUid) {
        return dicom.getInstanceMeta(sopUid);
    }
}