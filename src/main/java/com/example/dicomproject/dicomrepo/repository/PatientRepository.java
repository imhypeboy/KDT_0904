package com.example.dicomproject.dicomrepo.repository;


import com.example.dicomproject.dicomrepo.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, String> {}