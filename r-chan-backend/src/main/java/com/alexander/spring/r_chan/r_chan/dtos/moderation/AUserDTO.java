package com.alexander.spring.r_chan.r_chan.dtos.moderation;

import com.alexander.spring.r_chan.r_chan.entity.AdminUser;
import com.alexander.spring.r_chan.r_chan.entity.ModerationLog;
import com.alexander.spring.r_chan.r_chan.enums.AdminRole;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class AUserDTO {

    private UUID id;
    private String username;
    private String email;
    private String passwordHash;
    private AdminRole role;
    private boolean accountEnabled;
    private boolean emailVerified;
    private LocalDateTime firstLogin;
    private LocalDateTime lastLogin;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private List<ModerationLog> moderationLogs = new ArrayList<>();

    public AUserDTO(AdminUser adminUser){
        this.id = adminUser.getId();
        this.username = adminUser.getUsername();
        this.email = adminUser.getEmail();
        this.passwordHash = adminUser.getPasswordHash();
        this.role = adminUser.getRole();
        this.accountEnabled = adminUser.isAccountEnabled();
        this.emailVerified = adminUser.isEmailVerified();
        this.firstLogin = adminUser.getFirstLogin();
        this.lastLogin = adminUser.getLastLogin();
        this.createdDate = adminUser.getCreatedDate();
        this.updatedDate = adminUser.getUpdatedDate();
    }
}
