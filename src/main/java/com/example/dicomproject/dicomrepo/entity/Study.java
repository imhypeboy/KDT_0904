package com.example.dicomproject.dicomrepo.entity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;

@Entity
@Table(
        name = "STUDYTAB",
        uniqueConstraints = @UniqueConstraint(
                name = "UK_STUDY_PID_STUDYINSUID",
                columnNames = {"PID", "STUDYINSUID"}
        )
)
@Immutable
@Getter @Setter
public class Study {

    @Id
    @Column(name = "STUDYKEY")
    private Long studyKey;                // PK

    @Column(name = "STUDYINSUID")
    private String studyInstanceUid;      // UK( PID + STUDYINSUID )

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PID")             // FK → PatientTab.PID
    private Patient patient;

    @Column(name = "STUDYDATE")
    private String studyDate;             // yyyyMMdd (VARCHAR2)

    @Column(name = "STUDYTIME")
    private String studyTime;             // HHmmss (VARCHAR2)

    @Column(name = "ACCESSNUM")
    private String accessionNumber;

    @Column(name = "STUDYID")
    private String studyId;

    @Column(name = "STUDYDESC")
    private String studyDesc;

    @Column(name = "MODALITY")
    private String modality;

    @Column(name = "BODYPART")
    private String bodyPart;

    @Column(name = "PNAME")
    private String patientName;

    @Column(name = "PSEX")
    private String patientSex;

    @Column(name = "PBIRTHDATETIME")
    private String patientBirthDateTime;

    @Column(name = "PATAGE")
    private String patientAge;

    @Column(name = "SERIESCNT")
    private Integer seriesCount;

    @Column(name = "IMAGECNT")
    private Integer imageCount;

    @Column(name = "DELFLAG")
    private Integer delFlag;               // 0/1
}