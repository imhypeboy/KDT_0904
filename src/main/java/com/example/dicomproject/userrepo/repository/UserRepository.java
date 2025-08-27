package com.example.dicomproject.userrepo.repository;

import java.util.Optional;

import com.example.dicomproject.userrepo.entity.UserAccount;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount> findByUsername(String username);

    boolean existsByUsername(String username);

    /**
     * 로그인 시 권한까지 한 번에 필요하면 fetch join으로 가져오기
     */
    @Query("""
           select u from UserAccount u
           left join fetch u.roles r
           where u.username = :username
           """)
    Optional<UserAccount> findWithRolesByUsername(@Param("username") String username);
}