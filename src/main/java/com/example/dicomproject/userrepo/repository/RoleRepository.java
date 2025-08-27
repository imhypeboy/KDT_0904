package com.example.dicomproject.userrepo.repository;


import java.util.Optional;

import com.example.dicomproject.userrepo.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);

    boolean existsByName(String name);
}