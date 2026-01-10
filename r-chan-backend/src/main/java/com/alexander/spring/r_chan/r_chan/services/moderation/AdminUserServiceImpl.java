package com.alexander.spring.r_chan.r_chan.services.moderation;

import com.alexander.spring.r_chan.r_chan.dtos.moderation.AUserDTO;
import com.alexander.spring.r_chan.r_chan.dtos.moderation.UserStatsDTO;
import com.alexander.spring.r_chan.r_chan.entity.AdminUser;
import com.alexander.spring.r_chan.r_chan.enums.Actions;
import com.alexander.spring.r_chan.r_chan.enums.AdminRole;
import com.alexander.spring.r_chan.r_chan.exceptions.AdminUserNotFoundException;
import com.alexander.spring.r_chan.r_chan.exceptions.PasswordDoesNotMatchException;
import com.alexander.spring.r_chan.r_chan.repository.AdminUserRepository;
import com.alexander.spring.r_chan.r_chan.services.email.EmailService;
import com.alexander.spring.r_chan.r_chan.services.moderation.logs.ModerationLogService;
import com.alexander.spring.r_chan.r_chan.services.security.CurrentUserService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Service
@Transactional
public class AdminUserServiceImpl implements AdminUserService {

    @Value("${app.settings.code_expires_at}")
    private Integer code_expires_at;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ModerationLogService moderationLogService;

    @Autowired
    private CurrentUserService currentUserService;

    private final Actions actions = null;

    @Override
    public UserStatsDTO getUserStats() {
        long totalUsers = adminUserRepository.count();
        long activeUsers = adminUserRepository.countByAccountEnabled(true);
        long pendingVerificationUsers = adminUserRepository.countByEmailVerified(false);

        return new UserStatsDTO(totalUsers, activeUsers, pendingVerificationUsers);
    }

    @Override
    public Page<AUserDTO> findAll(Pageable pageable) {
        return adminUserRepository.findAll(pageable).map(AUserDTO::new);
    }

    @Override
    public AUserDTO findById(UUID id) {
        return new AUserDTO(adminUserRepository.findById(id)
                .orElseThrow(() -> new AdminUserNotFoundException("id", id.toString())));
    }

    @Override
    public boolean existsById(UUID id) {
        return adminUserRepository.existsById(id);
    }

    @Override
    public AUserDTO findByUsername(String username) {
        return new AUserDTO(adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new AdminUserNotFoundException("username", username)));
    }

    @Override
    public AdminUser findAdminUserByUsername(String username) {
        return adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new AdminUserNotFoundException("username", username));
    }

    @Override
    public boolean existsByUsername(String username) {
        return adminUserRepository.existsByUsername(username);
    }

    @Override
    public AUserDTO findByEmail(String email) {
        return new AUserDTO(adminUserRepository.findByEmail(email)
                .orElseThrow(() -> new AdminUserNotFoundException("email", email)));
    }

    @Override
    public AdminUser findAdminUserByEmail(String email) {
        return adminUserRepository.findByEmail(email)
                .orElseThrow(() -> new AdminUserNotFoundException("email", email));
    }

    @Override
    public boolean existsByEmail(String email) {
        return adminUserRepository.existsByEmail(email);
    }

    @Override
    public AdminUser saveAdminUser(AdminUser adminUser, UUID createdByUserId) {
        //Validar que el rol no sea nulo
        if (adminUser.getRole() == null) {
            adminUser.setRole(AdminRole.MODERATOR);
        }

        AdminUser savedUser = adminUserRepository.save(adminUser);

        //Log de creación de usuario
        moderationLogService.logUserCreated(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getRole().toString(),
                createdByUserId
        );

        return savedUser;
    }

    @Override
    public AUserDTO updateUserRole(UUID userId, AdminRole newRole, UUID updatedByAdminId) {
        //Obtener usuario a actualizar
        AdminUser adminUser = adminUserRepository.findById(userId)
                .orElseThrow(() -> new AdminUserNotFoundException("id", userId.toString()));

        //Guardar el rol antiguo para el log
        AdminRole oldRole = adminUser.getRole();

        //Actualizar rol
        adminUser.setRole(newRole);

        //Guardar cambios
        AdminUser updatedUser = adminUserRepository.save(adminUser);

        //Log del cambio de rol usando el método correcto
        moderationLogService.logRoleChanged(updatedByAdminId, userId, oldRole.toString(), newRole.toString());

        return new AUserDTO(updatedUser);
    }

    @Override
    public void delete(UUID id, String rawPassword) {
        //Obtener el admin actual (solo para verificar que no se elimine a sí mismo)
        AdminUser currentAdmin = currentUserService.getCurrentAdminUser();

        //Obtener el usuario a eliminar
        AdminUser userToDelete = adminUserRepository.findById(id)
                .orElseThrow(() -> new AdminUserNotFoundException("id", id.toString()));

        //No permitir que un admin se elimine a sí mismo
        if (currentAdmin.getId().equals(id)) {
            throw new IllegalArgumentException("Administrators cannot delete themselves");
        }

        //ELIMINAR REGISTROS RELACIONADOS ANTES DE ELIMINAR EL USUARIO
        //1. Eliminar registros de password_reset_code
        try {
            //Usar la query nativa que agregamos al repository
            adminUserRepository.deletePasswordResetCodesByUserId(id);
        } catch (Exception e) {
            System.err.println("Error eliminando registros relacionados: " + e.getMessage());
            //Continuar con la eliminación del usuario incluso si falla eliminar los registros relacionados
        }

        //Verificar la contraseña del admin actual (para seguridad adicional)
        if (!passwordEncoder.matches(rawPassword, currentAdmin.getPasswordHash())) {
            throw new PasswordDoesNotMatchException();
        }

        String email = userToDelete.getEmail();
        String username = userToDelete.getUsername();

        //Log de eliminación antes de eliminar
        moderationLogService.logUserDeleted(id, username);

        //Eliminar el usuario
        adminUserRepository.delete(userToDelete);

        //Enviar email de confirmación
        try {
            emailService.sendDeleteEmail(email, username);
        } catch (MessagingException e) {
            System.err.println("Error sending delete email: " + e.getMessage());
        }
    }

    @Override
    public AUserDTO updateAdminUser(UUID id, AdminUser adminUser) {
        AdminUser adminUserDB = adminUserRepository.findById(id)
                .orElseThrow(() -> new AdminUserNotFoundException("id", id.toString()));

        //Capturar valores antiguos
        String oldUsername = adminUserDB.getUsername();
        String oldEmail = adminUserDB.getEmail();
        String oldRole =adminUserDB.getRole().toString();

        if (adminUser.getUsername() != null) {
            adminUserDB.setUsername(adminUser.getUsername());
        }

        if (adminUser.getEmail() != null) {
            adminUserDB.setEmail(adminUser.getEmail());
        }

        if (adminUser.getRole() != null) {
            adminUserDB.setRole(adminUser.getRole());
        }

        AdminUser updatedUser = adminUserRepository.save(adminUserDB);

        //Log de cambios de usuario
        Map<String, Object> details = new HashMap<>();
        if (!oldUsername.equals(updatedUser.getUsername())) {
            details.put("username", Map.of("from", oldUsername, "to", updatedUser.getUsername()));
        }
        if (!oldEmail.equals(updatedUser.getEmail())) {
            details.put("email", Map.of("from", oldEmail, "to", updatedUser.getEmail()));
        }
        if (!oldRole.equals(updatedUser.getRole())) {
            details.put("role", Map.of("from", oldRole, "to", updatedUser.getRole()));
            //Log específico para cambio de rol
            moderationLogService.logAction(
                    actions.USER_ROLE_CHANGED,
                    null,
                    null,
                    Map.of("userId", id, "from", oldRole, "to", updatedUser.getRole())
            );
        }

        if (!details.isEmpty()) {
            moderationLogService.logAction(
                    actions.USER_UPDATED,
                    null,
                    null,
                    details
            );
        }

        return new AUserDTO(updatedUser);
    }

    @Override
    public boolean changePassword(UUID userId, String currentPassword, String newPassword) {
        AdminUser adminUser = adminUserRepository.findById(userId)
                .orElseThrow(() -> new AdminUserNotFoundException("id", userId.toString()));

        //Verificar la contraseña actual
        if (!passwordEncoder.matches(currentPassword, adminUser.getPasswordHash())) {
            return false;
        }

        //Validar que la nueva contraseña no sea igual a la anterior
        if (passwordEncoder.matches(newPassword, adminUser.getPasswordHash())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        //Actualizar la contraseña
        adminUser.setPasswordHash(passwordEncoder.encode(newPassword));
        adminUserRepository.save(adminUser);

        //Log del cambio de contraseña (opcional)
        Map<String, Object> details = new HashMap<>();
        details.put("userId", userId);
        details.put("username", adminUser.getUsername());
        details.put("changedAt", LocalDateTime.now());

        try {
            moderationLogService.logAction(
                    Actions.USER_PASSWORD_CHANGED,
                    null,
                    null,
                    details
            );
        } catch (Exception e) {
            //Si falla el log, continuar igual
            System.err.println("Failed to log password change: " + e.getMessage());
        }

        return true;
    }

    @Override
    public void updateLoginInfo(UUID userId) {
        AdminUser adminUser = adminUserRepository.findById(userId)
                .orElseThrow(() -> new AdminUserNotFoundException("id", userId.toString()));

        LocalDateTime now = LocalDateTime.now();

        //Si es el primer login, establecer firstLogin
        if (adminUser.getFirstLogin() == null) {
            adminUser.setFirstLogin(now);
        }

        //Actualizar lastLogin
        adminUser.setLastLogin(now);

        adminUserRepository.save(adminUser);
    }

    @Override
    public boolean verifyEmail(String email, String verificationCode) {
        AdminUser user = adminUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        //Verificar que el email NO esté ya verificado
        if (user.isEmailVerified()) {
            return false; //El email ya está verificado
        }

        //Verificar que tengamos un código y que no sea nulo
        if (user.getVerificationCode() == null || verificationCode == null) {
            return false;
        }

        //Comparar códigos (ignorando mayúsculas/minúsculas y espacios)
        String dbCode = user.getVerificationCode().trim();
        String providedCode = verificationCode.trim();

        if (!dbCode.equals(providedCode)) {
            return false;
        }

        //Verificar que el código no haya expirado
        if (!user.isVerificationCodeValid()) {
            return false;
        }

        //Marcar como verificado y limpiar el código
        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        adminUserRepository.save(user);

        return true;
    }

    @Override
    public boolean resendVerificationCode(String email) {
        AdminUser user = adminUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        //Si el email ya está verificado, no reenviar
        if (user.isEmailVerified()) {
            return false;
        }

        //Generar nuevo código
        String newCode = generateVerificationCode();
        user.setVerificationCode(newCode);
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(code_expires_at));
        adminUserRepository.save(user);

        //Enviar email
        try {
            emailService.sendVerificationEmail(
                    user.getEmail(),
                    user.getUsername(),
                    newCode
            );
            return true;
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}