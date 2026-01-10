package com.alexander.spring.r_chan.r_chan.controllers.password_reset;

import com.alexander.spring.r_chan.r_chan.dtos.password.NewPasswordDTO;
import com.alexander.spring.r_chan.r_chan.dtos.password.PasswordResetRequestDTO;
import com.alexander.spring.r_chan.r_chan.dtos.password.VerifyResetCodeDTO;
import com.alexander.spring.r_chan.r_chan.services.security.password_reset.PasswordResetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth/password-reset")
public class PasswordResetController {

    @Autowired
    private Validator validator;

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/request")
    public ResponseEntity<?> requestPasswordReset(@RequestPart(value = "sendData") String postDataJson) {

        ObjectMapper objectMapper = new ObjectMapper();
        PasswordResetRequestDTO passwordResetRequestDTO;

        try {
            passwordResetRequestDTO = objectMapper.readValue(postDataJson, PasswordResetRequestDTO.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validación manual usando el validador de SPRING
        Set<ConstraintViolation<PasswordResetRequestDTO>> violations = validator.validate(passwordResetRequestDTO);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<PasswordResetRequestDTO> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        try {
            boolean success = passwordResetService.initiatePasswordReset(passwordResetRequestDTO.getEmail());

            Map<String, String> response = new HashMap<>();
            if (success) {
                response.put("message", "If an account exists with this email, a reset code has been sent.");
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Failed to process reset request");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to send reset email: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyResetCode(@RequestPart(value = "sendData") String postDataJson) {

        ObjectMapper objectMapper = new ObjectMapper();
        VerifyResetCodeDTO verifyResetCodeDTO;

        try {
            verifyResetCodeDTO = objectMapper.readValue(postDataJson, VerifyResetCodeDTO.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validación manual usando el validador de SPRING
        Set<ConstraintViolation<VerifyResetCodeDTO>> violations = validator.validate(verifyResetCodeDTO);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<VerifyResetCodeDTO> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        boolean isValid = passwordResetService.verifyResetCode(verifyResetCodeDTO.getEmail(), verifyResetCodeDTO.getCode());

        Map<String, Object> response = new HashMap<>();
        if (isValid) {
            response.put("valid", true);
            response.put("message", "Verification code is valid");
            return ResponseEntity.ok(response);
        } else {
            response.put("valid", false);
            response.put("error", "Invalid or expired verification code");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestPart(value = "sendData") String postDataJson) {

        ObjectMapper objectMapper = new ObjectMapper();
        NewPasswordDTO newPasswordDTO;

        try {
            newPasswordDTO = objectMapper.readValue(postDataJson, NewPasswordDTO.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validación manual usando el validador de SPRING
        Set<ConstraintViolation<NewPasswordDTO>> violations = validator.validate(newPasswordDTO);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<NewPasswordDTO> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        boolean success = passwordResetService.resetPassword(
                newPasswordDTO.getEmail(),
                newPasswordDTO.getCode(),
                newPasswordDTO.getNewPassword()
        );

        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("success", true);
            response.put("message", "Password has been reset successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", "Failed to reset password. Code may be invalid or expired.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}