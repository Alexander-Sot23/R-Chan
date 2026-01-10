package com.alexander.spring.r_chan.r_chan.services.security;

import com.alexander.spring.r_chan.r_chan.entity.AdminUser;
import com.alexander.spring.r_chan.r_chan.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CurrentUserServiceImpl implements CurrentUserService{

    @Autowired
    private AdminUserRepository adminUserRepository;

    /**
     * Obtiene el usuario administrador actualmente autenticado
     */
    @Override
    public AdminUser getCurrentAdminUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();
        String username;

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            username = (String) principal;
        } else {
            throw new RuntimeException("Unable to get user details from authentication");
        }

        return adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin user not found: " + username));
    }

    /**
     * Obtiene el ID del usuario actual
     */
    @Override
    public UUID getCurrentAdminUserId() {
        return getCurrentAdminUser().getId();
    }

    /**
     * Verifica si el usuario actual tiene un rol específico
     */
    @Override
    public boolean hasRole(String role) {
        AdminUser user = getCurrentAdminUser();
        return user.getRole() != null && user.getRole().equals(role);
    }
}