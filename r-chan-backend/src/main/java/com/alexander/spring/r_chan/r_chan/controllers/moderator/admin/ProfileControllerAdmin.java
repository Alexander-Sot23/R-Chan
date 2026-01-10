package com.alexander.spring.r_chan.r_chan.controllers.moderator.admin;

import com.alexander.spring.r_chan.r_chan.dtos.moderation.AUserDTO;
import com.alexander.spring.r_chan.r_chan.services.moderation.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/api")
public class ProfileControllerAdmin {

    @Autowired
    private AdminUserService adminUserService;

    @GetMapping("/profile")
    public ResponseEntity<AUserDTO> getProfile() {
        try {
            //Obtener el usuario autenticado del contexto de seguridad de Spring
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            //Buscar el usuario por username
            AUserDTO user = adminUserService.findByUsername(username);

            if (user != null) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(401).build();
        }
    }
}