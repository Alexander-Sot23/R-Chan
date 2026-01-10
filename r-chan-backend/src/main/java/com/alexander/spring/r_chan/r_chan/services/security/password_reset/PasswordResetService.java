package com.alexander.spring.r_chan.r_chan.services.security.password_reset;

public interface PasswordResetService {
    boolean initiatePasswordReset(String email);
    boolean verifyResetCode(String email, String code);
    boolean resetPassword(String email, String code, String newPassword);
}
