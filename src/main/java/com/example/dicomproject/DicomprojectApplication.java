package com.example.dicomproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class DicomprojectApplication {

public static void main(String[] args) {
    SpringApplication.run(DicomprojectApplication.class, args);
}

}
