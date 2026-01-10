package com.alexander.spring.r_chan.r_chan.controllers.moderator;

import com.alexander.spring.r_chan.r_chan.dtos.moderation.AUserDTO;
import com.alexander.spring.r_chan.r_chan.services.moderation.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/moderator/api/user")
public class AUserControllerModerator {

    @Autowired
    private AdminUserService adminUserService;

    @GetMapping
    private ResponseEntity<Page<AUserDTO>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort).descending());
        return ResponseEntity.ok(adminUserService.findAll(pageable));
    }

    @GetMapping("/id")
    public ResponseEntity<?> findById(@RequestParam(value = "id") UUID id){
        return ResponseEntity.ok(adminUserService.findById(id));
    }

    @GetMapping("/username")
    public ResponseEntity<?> findByUsername(@RequestParam(value = "username") String username){
        return ResponseEntity.ok(adminUserService.findByUsername(username));
    }

    @GetMapping("/email")
    public ResponseEntity<?> findByEmail(@RequestParam(value = "email") String email){
        return ResponseEntity.ok(adminUserService.findByEmail(email));
    }
}
