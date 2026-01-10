package com.alexander.spring.r_chan.r_chan.entity;

import com.alexander.spring.r_chan.r_chan.enums.AdminRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@Table(name = "admin_user")
@NoArgsConstructor
@AllArgsConstructor
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_name", unique = true)
    @NotBlank
    @Size(max = 50)
    private String username;

    @Column(unique = true)
    @NotBlank
    @Size(max = 100)
    private String email;

    @Column(name = "password_hash")
    @NotBlank
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private AdminRole role = AdminRole.MODERATOR;

    @Column(name = "account_enabled", nullable = false)
    private boolean accountEnabled = true;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "verification_code", length = 6)
    private String verificationCode;

    @Column(name = "verification_code_expires_at")
    private LocalDateTime verificationCodeExpiresAt;

    @Column(name = "first_login")
    private LocalDateTime firstLogin;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @UpdateTimestamp
    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @OneToMany(mappedBy = "adminUser", cascade = CascadeType.ALL)
    private List<ModerationLog> moderationLogs = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }

    public boolean isVerificationCodeValid() {
        if (verificationCode == null || verificationCodeExpiresAt == null) {
            return false;
        }
        return LocalDateTime.now().isBefore(verificationCodeExpiresAt);
    }

}
