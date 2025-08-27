package com.example.dicomproject.dicomrepo.entity;

import java.io.Serializable;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class ImageId implements Serializable {
    private Long studyKey;
    private Long seriesKey;
    private Long imageKey;
}