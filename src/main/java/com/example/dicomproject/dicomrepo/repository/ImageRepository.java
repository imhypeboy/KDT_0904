package com.example.dicomproject.dicomrepo.repository;

import com.example.dicomproject.dicomrepo.entity.Image;
import com.example.dicomproject.dicomrepo.entity.ImageId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, ImageId> {
    List<Image> findBySeries_SeriesInstanceUid(String seriesInstanceUid);
    Optional<Image> findBySopInstanceUid(String sopInstanceUid);
}