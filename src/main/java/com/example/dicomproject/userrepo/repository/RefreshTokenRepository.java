package com.example.dicomproject.userrepo.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.example.dicomproject.userrepo.entity.RefreshToken;
import com.example.dicomproject.userrepo.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findAllByUser(UserAccount user);

    void deleteByUser(UserAccount user);

    long deleteByExpiresAtBefore(LocalDateTime threshold);
}