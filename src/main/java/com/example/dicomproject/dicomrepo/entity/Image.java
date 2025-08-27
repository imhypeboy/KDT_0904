package com.example.dicomproject.dicomrepo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;
import com.example.dicomproject.dicomrepo.entity.ImageId;
@Entity
@Table(
        name = "IMAGETAB",
        uniqueConstraints = @UniqueConstraint(
                name = "UK_IMAGE_SOPINSTANCEUID",
                columnNames = {"SOPINSTANCEUID"}
        )
)
@IdClass(ImageId.class)
@Immutable
@Getter @Setter
public class Image {

    @Id
    @Column(name = "STUDYKEY")
    private Long studyKey;                 // PK part

    @Id
    @Column(name = "SERIESKEY")
    private Long seriesKey;                // PK part

    @Id
    @Column(name = "IMAGEKEY")
    private Long imageKey;                 // PK part

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "STUDYKEY", referencedColumnName = "STUDYKEY",
                    insertable = false, updatable = false),
            @JoinColumn(name = "SERIESKEY", referencedColumnName = "SERIESKEY",
                    insertable = false, updatable = false)
    })
    private Series series;                 // FK → SeriesTab

    @Column(name = "STUDYINSUID")
    private String studyInstanceUid;

    @Column(name = "SERIESINSUID")
    private String seriesInstanceUid;

    @Column(name = "SOPINSTANCEUID")
    private String sopInstanceUid;         // UK

    @Column(name = "SOPCLASSUID")
    private String sopClassUid;

    @Column(name = "STSTORAGEID")
    private Long storageId;

    @Column(name = "PATH")
    private String path;                   // 풀경로

    @Column(name = "FNAME")
    private String fname;                  // 파일명

    @Column(name = "DELFLAG")
    private Integer delFlag;               // 0/1
}