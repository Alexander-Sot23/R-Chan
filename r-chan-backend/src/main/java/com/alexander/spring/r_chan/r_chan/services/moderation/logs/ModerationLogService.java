package com.alexander.spring.r_chan.r_chan.services.moderation.logs;

import com.alexander.spring.r_chan.r_chan.entity.ModerationLog;
import com.alexander.spring.r_chan.r_chan.enums.Actions;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public interface ModerationLogService {
    ModerationLog logAction(Actions action,
                            UUID postId,
                            UUID repostId,
                            Map<String, Object> details);
    ModerationLog logPostCreated(UUID postId, Map<String, Object> details);
    ModerationLog logPostUpdated(UUID postId, Map<String, Object> oldValues, Map<String, Object> newValues);
    ModerationLog logPostDeleted(UUID postId, Map<String, Object> postDetails);
    ModerationLog logPostApproved(UUID postId, String reason);
    ModerationLog logPostRejected(UUID postId, String reason);
    ModerationLog logPostFileDeleted(UUID postId, String fileName, String fileUrl);
    ModerationLog logRepostCreated(UUID repostId, UUID postId, Map<String, Object> details);
    ModerationLog logRepostDeleted(UUID repostId, UUID postId, Map<String, Object> details);
    ModerationLog logUserCreated(UUID userId, String username, String role, UUID createdByUserId);
    ModerationLog logUserDeleted(UUID userId, String username);
    ModerationLog logRoleChanged(UUID adminId, UUID targetUserId, String oldRole, String newRole);
    Long countByAdminId(UUID adminId);
    long countAllLogs();
    long countDistinctAdmins();
    long countPostsAffected();
    long countRepostsAffected();
    Page<ModerationLog> getLogsByAdmin(UUID adminId, Pageable pageable);
    Page<ModerationLog> getLogsByPost(UUID postId, Pageable pageable);
    Page<ModerationLog> getLogsByAction(Actions action, Pageable pageable);
    Page<ModerationLog> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    Page<ModerationLog> getAllLogs(Pageable pageable);
}
