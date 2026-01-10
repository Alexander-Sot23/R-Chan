package com.alexander.spring.r_chan.r_chan.services.moderation;

import com.alexander.spring.r_chan.r_chan.dtos.moderation.AUserDTO;
import com.alexander.spring.r_chan.r_chan.dtos.moderation.UserStatsDTO;
import com.alexander.spring.r_chan.r_chan.entity.AdminUser;
import com.alexander.spring.r_chan.r_chan.enums.AdminRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AdminUserService {
    UserStatsDTO getUserStats();
    Page<AUserDTO> findAll(Pageable pageable);
    AUserDTO findById(UUID id);
    boolean existsById(UUID id);
    AUserDTO findByUsername(String username);
    AdminUser findAdminUserByUsername(String username);
    boolean existsByUsername(String username);
    AUserDTO findByEmail(String email);
    AdminUser findAdminUserByEmail(String email);
    boolean existsByEmail(String email);
    AdminUser saveAdminUser(AdminUser adminUser, UUID createdByUserId);
    AUserDTO updateUserRole(UUID userId, AdminRole newRole, UUID updatedByAdminId);
    AUserDTO updateAdminUser(UUID id, AdminUser adminUser);
    boolean changePassword(UUID userId, String currentPassword, String newPassword);
    void delete(UUID id, String password);
    void updateLoginInfo(UUID userId);
    boolean verifyEmail(String email, String verificationCode);
    boolean resendVerificationCode(String email);
}
