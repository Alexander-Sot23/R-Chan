package com.alexander.spring.r_chan.r_chan.services.security;

import com.alexander.spring.r_chan.r_chan.entity.AdminUser;

import java.util.UUID;

public interface CurrentUserService {
    AdminUser getCurrentAdminUser();
    UUID getCurrentAdminUserId();
    boolean hasRole(String role);
}
