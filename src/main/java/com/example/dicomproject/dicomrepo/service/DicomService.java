package com.example.dicomproject.dicomrepo.service;


import com.example.dicomproject.dicomrepo.dto.*;
import com.example.dicomproject.dicomrepo.entity.Series;
import com.example.dicomproject.dicomrepo.entity.Study;
import com.example.dicomproject.dicomrepo.repository.ImageRepository;
import com.example.dicomproject.dicomrepo.repository.SeriesRepository;
import com.example.dicomproject.dicomrepo.repository.StudyRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true, transactionManager = "oracleTx")
public class DicomService {

    private final StudyRepository studyRepo;
    private final SeriesRepository seriesRepo;
    private final ImageRepository imageRepo;

    public List<StudySummaryDto> searchStudies(String pid, String from, String to, String modality) {
        List<Study> studies = (pid != null && from != null && to != null)
                ? studyRepo.findByPatient_PidAndStudyDateBetween(pid, from, to)
                : (pid != null ? studyRepo.findByPatient_Pid(pid) : studyRepo.findAll());

        return studies.stream()
                .filter(s -> modality == null || modality.equalsIgnoreCase(s.getModality()))
                .map(this::toStudySummary)
                .toList();
    }

    public StudyDetailDto getStudy(String studyUid) {
        var study = studyRepo.findByStudyInstanceUid(studyUid).orElseThrow();
        var series = seriesRepo.findByStudy_StudyInstanceUid(studyUid)
                .stream().map(this::toSeriesSummary).toList();
        return new StudyDetailDto(
                study.getStudyKey(), study.getStudyInstanceUid(),
                study.getPatient().getPid(), study.getPatientName(),
                study.getStudyDate(), study.getStudyTime(),
                study.getModality(), study.getBodyPart(),
                study.getAccessionNumber(),
                study.getSeriesCount(), study.getImageCount(),
                series
        );
    }

    public List<SeriesSummaryDto> listSeries(String studyUid) {
        return seriesRepo.findByStudy_StudyInstanceUid(studyUid).stream()
                .map(this::toSeriesSummary)
                .toList();
    }

    public List<ImageSummaryDto> listInstances(String seriesUid) {
        return imageRepo.findBySeries_SeriesInstanceUid(seriesUid).stream()
                .map(i -> new ImageSummaryDto(i.getStudyKey(), i.getSeriesKey(), i.getImageKey(),
                        i.getSopInstanceUid(), i.getFname()))
                .toList();
    }

    public ImageMetaDto getInstanceMeta(String sopUid) {
        var i = imageRepo.findBySopInstanceUid(sopUid).orElseThrow();
        return new ImageMetaDto(
                i.getStudyKey(), i.getSeriesKey(), i.getImageKey(),
                i.getStudyInstanceUid(), i.getSeriesInstanceUid(), i.getSopInstanceUid(),
                tidyPath(i.getPath()), i.getFname(),
                // modality는 Series/Study에 있으므로 참고용
                null, i.getStorageId()
        );
    }

    private String tidyPath(String p) {
        if (p == null) return "";
        String r = p.replace('\\', '/');
        if (r.startsWith("/")) r = r.substring(1);
        if (!r.endsWith("/") && !r.isEmpty()) r = r + "/";
        return r;
    }

    private StudySummaryDto toStudySummary(Study s) {
        return new StudySummaryDto(
                s.getStudyKey(), s.getStudyInstanceUid(),
                s.getPatient().getPid(), s.getPatientName(),
                s.getAccessionNumber(),
                s.getStudyDate(), s.getModality(),
                s.getSeriesCount(), s.getImageCount()
        );
    }

    private SeriesSummaryDto toSeriesSummary(Series se) {
        return new SeriesSummaryDto(
                se.getStudyKey(), se.getSeriesKey(),
                se.getSeriesInstanceUid(),
                se.getModality(), se.getBodyPart(),
                se.getImageCount()
        );
    }
}