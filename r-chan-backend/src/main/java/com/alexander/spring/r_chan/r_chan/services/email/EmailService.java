package com.alexander.spring.r_chan.r_chan.services.email;

import jakarta.mail.MessagingException;

public interface EmailService {
    void sendPasswordResetEmail(String to, String username, String resetCode) throws MessagingException;
    void sendVerificationEmail(String to, String username, String verificationCode) throws MessagingException;
    void sendDeleteEmail(String to, String username) throws MessagingException;
}
