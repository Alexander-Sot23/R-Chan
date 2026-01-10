package com.alexander.spring.r_chan.r_chan.services.security.user_details;

import com.alexander.spring.r_chan.r_chan.entity.AdminUser;
import com.alexander.spring.r_chan.r_chan.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminUserDetailsService implements UserDetailsService {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<AdminUser> userOptional = adminUserRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            AdminUser adminUser = userOptional.get();

            //Convertir el enum AdminRole a autoridades de Spring Security
            List<GrantedAuthority> authorities = getAuthorities(adminUser);

            return User.builder()
                    .username(adminUser.getUsername())
                    .password(adminUser.getPasswordHash())
                    .authorities(authorities)
                    .accountExpired(false)
                    .accountLocked(false)
                    .credentialsExpired(false)
                    .build();
        } else {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
    }

    private List<GrantedAuthority> getAuthorities(AdminUser adminUser) {
        //Convertir el enum role a SimpleGrantedAuthority
        String roleWithPrefix = "ROLE_" + adminUser.getRole().name();

        return List.of(new SimpleGrantedAuthority(roleWithPrefix));
    }
}