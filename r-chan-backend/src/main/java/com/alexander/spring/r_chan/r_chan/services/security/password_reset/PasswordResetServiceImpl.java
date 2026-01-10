package com.alexander.spring.r_chan.r_chan.services.security.password_reset;

import com.alexander.spring.r_chan.r_chan.entity.AdminUser;
import com.alexander.spring.r_chan.r_chan.entity.PasswordResetCode;
import com.alexander.spring.r_chan.r_chan.repository.AdminUserRepository;
import com.alexander.spring.r_chan.r_chan.repository.PasswordResetCodeRepository;
import com.alexander.spring.r_chan.r_chan.services.email.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class PasswordResetServiceImpl implements PasswordResetService{

    @Value("${app.settings.code_expires_at}")
    private Integer code_expires_at;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordResetCodeRepository passwordResetCodeRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    //Generamos un codigo random de 6 dijitos
    private String generateResetCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    @Override
    public boolean initiatePasswordReset(String email) {
        Optional<AdminUser> userOptional = adminUserRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            //Por seguiridad evitamos revelar si el usuario existe o no
            return true; //Devuelve siempre verdadero para evitar la enumeracion de correo electronico
        }

        AdminUser user = userOptional.get();

        //Invalidar cualquier codigo no existente para el usuario
        passwordResetCodeRepository.findFirstByAdminUserAndIsUsedFalseOrderByCreatedAtDesc(user)
                .ifPresent(existingCode -> {
                    existingCode.setUsed(true);
                    passwordResetCodeRepository.save(existingCode);
                });

        //Generar nuevo codigo de reinicio
        String resetCode = generateResetCode();
        PasswordResetCode passwordResetCode = new PasswordResetCode();
        passwordResetCode.setAdminUser(user);
        passwordResetCode.setCode(resetCode);
        passwordResetCode.setExpiresAt(LocalDateTime.now().plusMinutes(code_expires_at)); //Tiempo de expiracion
        passwordResetCode.setUsed(false);

        passwordResetCodeRepository.save(passwordResetCode);

        try {
            //Enviar emial con codigo de reinicio
            emailService.sendPasswordResetEmail(
                    user.getEmail(),
                    user.getUsername(),
                    resetCode
            );
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Failed to send reset email", e);
        }
    }

    @Override
    public boolean verifyResetCode(String email, String code) {

        Optional<AdminUser> userOptional = adminUserRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return false;
        }

        AdminUser user = userOptional.get();

        Optional<PasswordResetCode> resetCodeOptional =
                passwordResetCodeRepository.findByCodeAndAdminUserAndIsUsedFalse(code, user);


        if (resetCodeOptional.isEmpty()) {
            return false;
        }

        PasswordResetCode resetCode = resetCodeOptional.get();

        boolean isValid = resetCode.isValid();

        return isValid;
    }

    @Override
    public boolean resetPassword(String email, String code, String newPassword) {
        Optional<AdminUser> userOptional = adminUserRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return false;
        }

        AdminUser user = userOptional.get();
        Optional<PasswordResetCode> resetCodeOptional =
                passwordResetCodeRepository.findByCodeAndAdminUserAndIsUsedFalse(code, user);

        if (resetCodeOptional.isEmpty()) {
            return false;
        }

        PasswordResetCode resetCode = resetCodeOptional.get();

        //Verificar si el codigo sigue siendo valido
        if (!resetCode.isValid()) {
            return false;
        }

        //Actualizar contraseña
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        adminUserRepository.save(user);

        //Marcar codigo como USADO
        resetCode.setUsed(true);
        passwordResetCodeRepository.save(resetCode);

        return true;
    }

    //Tarea programada para eliminar codigos expirados diariamente a las 3 A.M
    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanupExpiredCodes() {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        passwordResetCodeRepository.deleteByExpiresAtBefore(twentyFourHoursAgo);
    }
}