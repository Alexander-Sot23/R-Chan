package com.alexander.spring.r_chan.r_chan.controllers.exception_handler;

import com.alexander.spring.r_chan.r_chan.exceptions.*;
import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandlerController {

    @ExceptionHandler(PostNotFoundException.class)
    public ResponseEntity<Map<String, String>> handlePostNotFound(PostNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error",ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(RePostNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleRePostNotFound(RePostNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error",ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(SectionNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleSectionNotFound(SectionNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error",ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(AdminUserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleAdminUserNotFound(AdminUserNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error",ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ModerationLogNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleModerationLogNotFound(ModerationLogNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error",ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(PasswordDoesNotMatchException.class)
    public ResponseEntity<Map<String, String>> handlePasswordNotMatch(PasswordDoesNotMatchException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error",ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<Map<String, String>> handleExpiredJwt(ExpiredJwtException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Token JWT ha expirado");
        error.put("type", "TOKEN_EXPIRED");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}
