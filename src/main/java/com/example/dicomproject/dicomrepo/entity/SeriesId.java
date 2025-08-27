package com.example.dicomproject.dicomrepo.entity;

import java.io.Serializable;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class SeriesId implements Serializable {
    private Long studyKey;
    private Long seriesKey;
}
