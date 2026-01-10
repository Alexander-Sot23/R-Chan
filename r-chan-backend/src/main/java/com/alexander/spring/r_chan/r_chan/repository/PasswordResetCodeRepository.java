package com.alexander.spring.r_chan.r_chan.repository;

import com.alexander.spring.r_chan.r_chan.entity.AdminUser;
import com.alexander.spring.r_chan.r_chan.entity.PasswordResetCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, UUID> {
    Optional<PasswordResetCode> findByCodeAndAdminUserAndIsUsedFalse(String code, AdminUser adminUser);
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
    Optional<PasswordResetCode> findFirstByAdminUserAndIsUsedFalseOrderByCreatedAtDesc(AdminUser adminUser);
}
