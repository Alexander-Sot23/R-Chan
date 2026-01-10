package com.alexander.spring.r_chan.r_chan.services.email;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class EmailServiceImpl implements EmailService{

    @Value("${app.settings.code_expires_at}")
    private Integer code_expires_at;

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private TemplateEngine templateEngine;

    public void sendPasswordResetEmail(String to, String username, String resetCode) throws MessagingException {
        //Preparar el contexto de evaluacion
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("resetCode", resetCode);
        context.setVariable("expiryMinutes", code_expires_at); //Tiempo de expiracion

        //Procesar la plantilla HTML
        String htmlContent = templateEngine.process("password-reset-email", context);

        //Crear el MIME message
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject("Password Reset Request - R-Chan");
        helper.setText(htmlContent, true); //verdadero = contenido HTML

        javaMailSender.send(mimeMessage);
    }


    @Override
    public void sendVerificationEmail(String to, String username, String verificationCode) throws MessagingException {
        //Preparar el contexto de evaluación
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("verificationCode", verificationCode);
        context.setVariable("expiryMinutes", code_expires_at);

        //Procesar la plantilla HTML
        String htmlContent = templateEngine.process("email-verification", context);

        //Crear el MIME message
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject("Verify Your Email - R-Chan");
        helper.setText(htmlContent, true);

        javaMailSender.send(mimeMessage);
    }

    @Override
    public void sendDeleteEmail(String to, String username) throws MessagingException {
        //Preparar el contexto de evaluación
        Context context = new Context();
        context.setVariable("username", username);

        //Agregar fecha actual
        context.setVariable("currentDate", LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")));

        //Procesar la plantilla HTML correcta (no "email-verification")
        String htmlContent = templateEngine.process("account-delete-email", context); //Cambia este nombre

        //Crear el MIME message
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject("Account Deletion Confirmation - R-Chan");
        helper.setText(htmlContent, true);

        javaMailSender.send(mimeMessage);
    }

}
