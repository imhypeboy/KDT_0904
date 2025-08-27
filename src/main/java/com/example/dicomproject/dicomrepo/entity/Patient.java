package com.example.dicomproject.dicomrepo.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "PATIENTTAB")
@Immutable
@Getter @Setter
public class Patient {

    @Id
    @Column(name = "PID")
    private String pid;               // PK

    @Column(name = "PNAME")
    private String name;

    @Column(name = "PSEX")
    private String sex;

    @Column(name = "PBIRTHDATE")
    private String birthDate;         // VARCHAR2 스키마라 String으로 매핑
}