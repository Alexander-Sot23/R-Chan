package com.alexander.spring.r_chan.r_chan.entity;

import com.alexander.spring.r_chan.r_chan.convert.MapToJsonConverter;
import com.alexander.spring.r_chan.r_chan.enums.Actions;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Data
@Table(name = "moderation_log")
public class ModerationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private AdminUser adminUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(30)")
    private Actions action;

    @Column(name = "post_id")
    private UUID postId;

    @Column(name = "repost_id")
    private UUID repostId;

    @Convert(converter = MapToJsonConverter.class)
    @Column(name = "details_json", columnDefinition = "TEXT")
    private Map<String, Object> details = new HashMap<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ModerationLog(AdminUser adminUser, Actions action, UUID postId, UUID repostId, Map<String, Object> details) {
        this.adminUser = adminUser;
        this.action = action;
        this.postId = postId;
        this.repostId = repostId;
        this.details = details != null ? details : new HashMap<>();
    }

    //Constructor vacio
    public ModerationLog() {

    }

    public void setDetails(Map<String, Object> details) {
        this.details = details != null ? details : new HashMap<>();
    }

}