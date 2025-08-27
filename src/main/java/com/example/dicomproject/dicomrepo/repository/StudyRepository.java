package com.example.dicomproject.dicomrepo.repository;

import com.example.dicomproject.dicomrepo.entity.Study;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudyRepository extends JpaRepository<Study, Long> {
    Optional<Study> findByStudyInstanceUid(String studyInstanceUid);
    List<Study> findByPatient_Pid(String pid);
    List<Study> findByPatient_PidAndStudyDateBetween(String pid, String from, String to);
}