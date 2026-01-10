package com.alexander.spring.r_chan.r_chan.dtos.moderation;

import com.alexander.spring.r_chan.r_chan.entity.ModerationLog;
import com.alexander.spring.r_chan.r_chan.enums.Actions;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
public class ModerationLogDTO {
    private UUID id;
    private Actions action;
    private UUID adminId;
    private String adminUsername;
    private UUID postId;
    private UUID repostId;
    private Map<String, Object> details;
    private LocalDateTime createdAt;

    public ModerationLogDTO(ModerationLog log) {
        this.id = log.getId();
        this.action = log.getAction();
        this.adminId = log.getAdminUser() != null ? log.getAdminUser().getId() : null;
        this.adminUsername = log.getAdminUser() != null ? log.getAdminUser().getUsername() : null;
        this.postId = log.getPostId();
        this.repostId = log.getRepostId();
        this.details = log.getDetails();
        this.createdAt = log.getCreatedAt();
    }

}