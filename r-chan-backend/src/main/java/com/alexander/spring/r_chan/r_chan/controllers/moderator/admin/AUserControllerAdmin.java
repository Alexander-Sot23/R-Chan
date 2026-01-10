package com.alexander.spring.r_chan.r_chan.controllers.moderator.admin;

import com.alexander.spring.r_chan.r_chan.dtos.email.VerifyEmailDTO;
import com.alexander.spring.r_chan.r_chan.dtos.moderation.ADMINRegisterUserDTO;
import com.alexander.spring.r_chan.r_chan.dtos.moderation.AUserDTO;
import com.alexander.spring.r_chan.r_chan.dtos.moderation.UserStatsDTO;
import com.alexander.spring.r_chan.r_chan.dtos.password.ChangePasswordDTO;
import com.alexander.spring.r_chan.r_chan.entity.AdminUser;
import com.alexander.spring.r_chan.r_chan.enums.AdminRole;
import com.alexander.spring.r_chan.r_chan.exceptions.AdminUserNotFoundException;
import com.alexander.spring.r_chan.r_chan.model.DeleteUserFormMODEL;
import com.alexander.spring.r_chan.r_chan.model.ResendVerificationMODEL;
import com.alexander.spring.r_chan.r_chan.services.moderation.AdminUserService;
import com.alexander.spring.r_chan.r_chan.services.email.EmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/admin/api/user")
public class AUserControllerAdmin {

    @Value("${app.settings.code_expires_at}")
    private Integer code_expires_at;

    @Autowired
    private Validator validator;

    @Autowired
    private AdminUserService adminUserService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private ObjectMapper objectMapper = new ObjectMapper();

    //Generar código de verificación de 6 dígitos
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    private AdminUser getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null) {
                return null;
            }

            if (authentication.getPrincipal() instanceof UserDetails) {
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                String username = userDetails.getUsername();

                //Obtener el AdminUser completo desde el servicio
                AdminUser adminUser = adminUserService.findAdminUserByUsername(username);
                return adminUser;
            } else {
                return null;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getUserStats() {
        return ResponseEntity.ok(adminUserService.getUserStats());
    }

    @GetMapping
    private ResponseEntity<Page<AUserDTO>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") ?
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        return ResponseEntity.ok(adminUserService.findAll(pageable));
    }

    @GetMapping("/id")
    public ResponseEntity<?> findById(@RequestParam(value = "id") UUID id) {
        return ResponseEntity.ok(adminUserService.findById(id));
    }

    @GetMapping("/username")
    public ResponseEntity<?> findByUsername(@RequestParam(value = "username") String username) {
        return ResponseEntity.ok(adminUserService.findByUsername(username));
    }

    @GetMapping("/email")
    public ResponseEntity<?> findByEmail(@RequestParam(value = "email") String email) {
        return ResponseEntity.ok(adminUserService.findByEmail(email));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestPart(value = "sendData") String postDataJson) {

        ObjectMapper objectMapper = new ObjectMapper();
        ADMINRegisterUserDTO adminRegisterUserDTO;

        try {
            adminRegisterUserDTO = objectMapper.readValue(postDataJson, ADMINRegisterUserDTO.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validación manual usando el validador de Spring
        Set<ConstraintViolation<ADMINRegisterUserDTO>> violations = validator.validate(adminRegisterUserDTO);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<ADMINRegisterUserDTO> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        //Validar que las contraseñas coincidan
        if (!adminRegisterUserDTO.getPassword().equals(adminRegisterUserDTO.getConfirmPassword())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Passwords do not match");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Verificar si el username ya existe
        if (adminUserService.existsByUsername(adminRegisterUserDTO.getUsername())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Username already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        //Verificar si el email ya existe
        if (adminUserService.existsByEmail(adminRegisterUserDTO.getEmail())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        //Obtener rol solicitado (por defecto MODERATOR)
        AdminRole requestedRole = adminRegisterUserDTO.getRole() != null ?
                adminRegisterUserDTO.getRole() : AdminRole.MODERATOR;

        //Crear usuario (ya no necesitamos verificar permisos porque Spring Security lo hace)
        AdminUser user = new AdminUser();
        user.setUsername(adminRegisterUserDTO.getUsername());
        user.setEmail(adminRegisterUserDTO.getEmail());
        user.setPasswordHash(passwordEncoder.encode(adminRegisterUserDTO.getPassword()));
        user.setRole(requestedRole);
        user.setEmailVerified(false);
        user.setAccountEnabled(true);

        //Generar código de verificación
        String verificationCode = generateVerificationCode();
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(code_expires_at));

        try {

            UUID currentUserId = getCurrentUserId();

            //Guardar usuario (sin createdByUserId ya que no necesitamos tracking detallado)
            AdminUser savedUser = adminUserService.saveAdminUser(user, currentUserId);

            //Enviar email de verificación
            emailService.sendVerificationEmail(
                    user.getEmail(),
                    user.getUsername(),
                    verificationCode
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration successful. Please check your email for verification code.");
            response.put("userId", savedUser.getId());
            response.put("role", savedUser.getRole());
            response.put("note", "Verification code sent to your email");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestPart(value = "sendData") String postDataJson) {

        ObjectMapper objectMapper = new ObjectMapper();
        VerifyEmailDTO verifyEmailDTO;

        try {
            verifyEmailDTO = objectMapper.readValue(postDataJson, VerifyEmailDTO.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validación manual usando el validador de Spring
        Set<ConstraintViolation<VerifyEmailDTO>> violations = validator.validate(verifyEmailDTO);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<VerifyEmailDTO> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        try {
            boolean verified = adminUserService.verifyEmail(
                    verifyEmailDTO.getEmail(),
                    verifyEmailDTO.getVerificationCode()
            );

            if (verified) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Email verified successfully");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Invalid verification code or code has expired");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Verification failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestPart(value = "sendData") String postDataJson) {

        ObjectMapper objectMapper = new ObjectMapper();
        ResendVerificationMODEL resendVerificationMODEL;

        try {
            resendVerificationMODEL = objectMapper.readValue(postDataJson, ResendVerificationMODEL.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validación manual usando el validador de Spring
        Set<ConstraintViolation<ResendVerificationMODEL>> violations = validator.validate(resendVerificationMODEL);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<ResendVerificationMODEL> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        String email = resendVerificationMODEL.email();

        if (email == null || email.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        try {
            boolean success = adminUserService.resendVerificationCode(email);

            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Verification code resent to your email");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "User not found or email already verified");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to resend verification: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable UUID userId,
            @RequestParam AdminRole newRole) {

        try {
            AdminUser currentUser = getCurrentUser();

            //Validar que el usuario actual sea ADMIN
            if (currentUser == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Authentication required");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            //Solo ADMINS pueden modificar roles
            if (currentUser.getRole() != AdminRole.ADMIN) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Only ADMIN users can modify roles");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            //Validar que no sea el propio usuario
            if (userId.equals(currentUser.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "You cannot change your own role");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            //Verificar que el usuario a modificar exista
            AUserDTO userToUpdate = adminUserService.findById(userId);
            if (userToUpdate == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            //Validar que el nuevo rol sea válido
            if (newRole == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Role is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            //Si intentan cambiar a un rol igual, no hacer nada
            if (userToUpdate.getRole() == newRole) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "User role is already " + newRole);
                response.put("user", userToUpdate);
                return ResponseEntity.ok(response);
            }

            //Actualizar rol (el logging ya se hace en el servicio)
            AUserDTO updatedUser = adminUserService.updateUserRole(userId, newRole, currentUser.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User role updated successfully");
            response.put("user", updatedUser);

            return ResponseEntity.ok(response);

        } catch (AdminUserNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update user role: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<?> changeMyPassword(
            @RequestPart(value = "sendData") String postDataJson) {
        AdminUser currentUser = getCurrentUser();

        if (currentUser == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        ObjectMapper objectMapper = new ObjectMapper();
        ChangePasswordDTO changePasswordDTO;

        try {
            changePasswordDTO = objectMapper.readValue(postDataJson, ChangePasswordDTO.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validación manual usando el validador de Spring
        Set<ConstraintViolation<ChangePasswordDTO>> violations = validator.validate(changePasswordDTO);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<ChangePasswordDTO> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        //Validar que la nueva contraseña y la confirmación coincidan
        if (!changePasswordDTO.getNewPassword().equals(changePasswordDTO.getConfirmNewPassword())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "New passwords do not match");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        try {
            boolean success = adminUserService.changePassword(
                    currentUser.getId(),
                    changePasswordDTO.getCurrentPassword(),
                    changePasswordDTO.getNewPassword()
            );

            if (success) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Password changed successfully");
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Current password is incorrect");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to change password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAUser(@RequestPart(value = "sendData") String postDataJson) {

        ObjectMapper objectMapper = new ObjectMapper();
        DeleteUserFormMODEL deleteUserFormMODEL;

        try {
            deleteUserFormMODEL = objectMapper.readValue(postDataJson, DeleteUserFormMODEL.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validación manual usando el validador de Spring
        Set<ConstraintViolation<DeleteUserFormMODEL>> violations = validator.validate(deleteUserFormMODEL);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<DeleteUserFormMODEL> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        //Obtener información del usuario antes de eliminarlo para validación
        AUserDTO userToDelete = adminUserService.findById(deleteUserFormMODEL.id());
        if (userToDelete == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        //Eliminar usuario (el logging ya se hace en el servicio)
        adminUserService.delete(deleteUserFormMODEL.id(), deleteUserFormMODEL.password());

        return ResponseEntity.ok().build();
    }

    //Método helper para obtener el ID del usuario actual
    private UUID getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                String username = userDetails.getUsername();

                //Obtener el AdminUser completo para acceder al ID
                AdminUser currentUser = adminUserService.findAdminUserByUsername(username);
                return currentUser.getId();
            }
            return null;
        } catch (Exception e) {
            //Log del error si es necesario
            System.err.println("Error obteniendo ID del usuario actual: " + e.getMessage());
            return null;
        }
    }
}