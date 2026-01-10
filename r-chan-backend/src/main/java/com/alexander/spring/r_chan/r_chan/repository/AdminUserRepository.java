package com.alexander.spring.r_chan.r_chan.repository;

import com.alexander.spring.r_chan.r_chan.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface AdminUserRepository extends JpaRepository<AdminUser, UUID> {
    long countByAccountEnabled(boolean accountEnabled);
    long countByEmailVerified(boolean emailVerified);
    boolean existsById(UUID id);
    Optional<AdminUser> findByUsername(String username);
    boolean existsByUsername(String username);
    Optional<AdminUser> findByEmail(String email);
    boolean existsByEmail(String email);

    @Modifying
    @Query("DELETE FROM PasswordResetCode prc WHERE prc.adminUser.id = :userId")
    void deletePasswordResetCodesByUserId(@Param("userId") UUID userId);
}
