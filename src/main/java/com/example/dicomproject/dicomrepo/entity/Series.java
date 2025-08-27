package com.example.dicomproject.dicomrepo.entity;



import com.example.dicomproject.dicomrepo.entity.SeriesId;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;

@Entity
@Table(
        name = "SERIESTAB",
        uniqueConstraints = @UniqueConstraint(
                name = "UK_SERIES_SERIESINSUID",
                columnNames = {"SERIESINSUID"}
        )
)
@IdClass(SeriesId.class)
@Immutable
@Getter @Setter
public class Series {

    @Id
    @Column(name = "STUDYKEY")
    private Long studyKey;                 // PK part

    @Id
    @Column(name = "SERIESKEY")
    private Long seriesKey;                // PK part

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "STUDYKEY", insertable = false, updatable = false)
    private Study study;                   // (STUDYKEY) FK → StudyTab

    @Column(name = "STUDYINSUID")
    private String studyInstanceUid;       // 참고용

    @Column(name = "SERIESINSUID")
    private String seriesInstanceUid;      // UK

    @Column(name = "SERIESNUM")
    private Integer seriesNum;

    @Column(name = "MODALITY")
    private String modality;

    @Column(name = "SERIESDATE")
    private String seriesDate;

    @Column(name = "SERIESTIME")
    private String seriesTime;

    @Column(name = "BODYPART")
    private String bodyPart;

    @Column(name = "SERIESDESC")
    private String seriesDesc;

    @Column(name = "IMAGECNT")
    private Integer imageCount;

    @Column(name = "DELFLAG")
    private Integer delFlag;               // 0/1
}