package com.alexander.spring.r_chan.r_chan.controllers.login;

import com.alexander.spring.r_chan.r_chan.model.LoginFormMODEL;
import com.alexander.spring.r_chan.r_chan.repository.AdminUserRepository;
import com.alexander.spring.r_chan.r_chan.services.security.user_details.AdminUserDetailsService;
import com.alexander.spring.r_chan.r_chan.services.moderation.AdminUserService;
import com.alexander.spring.r_chan.r_chan.services.security.password_reset.PasswordResetService;
import com.alexander.spring.r_chan.r_chan.webtoken.JWTService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private Validator validator;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AdminUserDetailsService adminUserDetailsService;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private AdminUserService adminUserService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateAndGetToken(@RequestPart(value = "sendData") String postDataJson) {

        ObjectMapper objectMapper = new ObjectMapper();
        LoginFormMODEL loginFormModel;

        try {
            loginFormModel = objectMapper.readValue(postDataJson, LoginFormMODEL.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validación manual usando el validador de SPRING
        Set<ConstraintViolation<LoginFormMODEL>> violations = validator.validate(loginFormModel);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<LoginFormMODEL> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        try {
            //Determinar si es email o username
            String loginInput = loginFormModel.username(); //El campo se llama username pero puede contener email
            boolean isEmail = loginInput.contains("@");

            //Buscar el usuario por email o username
            var adminUser = isEmail
                    ? adminUserRepository.findByEmail(loginInput)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + loginInput))
                    : adminUserRepository.findByUsername(loginInput)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + loginInput));

            //Autenticar con el username real (no con el email)
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    adminUser.getUsername(), //Usar el username real para autenticación
                    loginFormModel.password()
            ));

            if (authentication.isAuthenticated()) {
                //Actualizar firstLogin y lastLogin
                adminUserService.updateLoginInfo(adminUser.getId());

                //Generar token con el username real
                String token = jwtService.generateToken(adminUser);

                //Crear respuesta JSON con el token
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("message", "Login successful");
                response.put("username", adminUser.getUsername()); //Username real
                response.put("email", adminUser.getEmail()); //Agregar email para claridad
                response.put("userId", adminUser.getId());
                response.put("role", adminUser.getRole());
                response.put("firstLogin", adminUser.getFirstLogin());
                response.put("lastLogin", adminUser.getLastLogin());

                return ResponseEntity.ok(response);
            } else {
                throw new UsernameNotFoundException("Credenciales invalidas.");
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        try {
            boolean success = passwordResetService.initiatePasswordReset(email);
            return ResponseEntity.ok(Map.of("success", true, "message", "Reset code sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send reset email"));
        }
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<?> verifyResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        if (email == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and code are required"));
        }

        boolean valid = passwordResetService.verifyResetCode(email, code);
        if (valid) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Code verified"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired code"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        if (email == null || code == null || newPassword == null || confirmPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));
        }

        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match"));
        }

        boolean success = passwordResetService.resetPassword(email, code, newPassword);
        if (success) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Password reset successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired reset code"));
        }
    }
}