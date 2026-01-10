package com.alexander.spring.r_chan.r_chan.services.moderation.logs;

import com.alexander.spring.r_chan.r_chan.entity.AdminUser;
import com.alexander.spring.r_chan.r_chan.entity.ModerationLog;
import com.alexander.spring.r_chan.r_chan.enums.Actions;
import com.alexander.spring.r_chan.r_chan.repository.AdminUserRepository;
import com.alexander.spring.r_chan.r_chan.repository.ModerationLogRepository;
import com.alexander.spring.r_chan.r_chan.services.security.CurrentUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class ModerationLogServiceImpl implements ModerationLogService{

    @Autowired
    private ModerationLogRepository moderationLogRepository;

    @Autowired
    private CurrentUserService currentUserService;

    @Autowired
    private AdminUserRepository adminUserRepository;

    /**
     * Método genérico para registrar cualquier acción
     */
    @Override
    public ModerationLog logAction(Actions action,
                                   UUID postId,
                                   UUID repostId,
                                   Map<String, Object> details) {

        AdminUser currentAdmin = currentUserService.getCurrentAdminUser();

        ModerationLog log = new ModerationLog();
        log.setAdminUser(currentAdmin);
        log.setAction(action);
        log.setPostId(postId);
        log.setRepostId(repostId);
        log.setDetails(details != null ? details : new HashMap<>());

        ModerationLog saved = moderationLogRepository.save(log);

        return saved;
    }

    /**
     * Logs específicos para Posts
     */
    @Override
    public ModerationLog logPostCreated(UUID postId, Map<String, Object> details) {
        return logAction(Actions.POST_CREATED, postId, null, details);
    }

    @Override
    public ModerationLog logPostUpdated(UUID postId, Map<String, Object> oldValues, Map<String, Object> newValues) {
        Map<String, Object> changes = new HashMap<>();
        changes.put("old", oldValues);
        changes.put("new", newValues);
        return logAction(Actions.POST_UPDATED, postId, null, changes);
    }

    @Override
    public ModerationLog logPostDeleted(UUID postId, Map<String, Object> postDetails) {
        return logAction(Actions.POST_DELETED, postId, null, postDetails);
    }

    @Override
    public ModerationLog logPostApproved(UUID postId, String reason) {
        Map<String, Object> details = new HashMap<>();
        details.put("reason", reason);
        details.put("approvedAt", LocalDateTime.now());
        return logAction(Actions.POST_APPROVED, postId, null, details);
    }

    @Override
    public ModerationLog logPostRejected(UUID postId, String reason) {
        Map<String, Object> details = new HashMap<>();
        details.put("reason", reason);
        details.put("rejectedAt", LocalDateTime.now());
        return logAction(Actions.POST_REJECTED, postId, null, details);
    }

    @Override
    public ModerationLog logPostFileDeleted(UUID postId, String fileName, String fileUrl) {
        Map<String, Object> details = new HashMap<>();
        details.put("fileName", fileName);
        details.put("fileUrl", fileUrl);
        details.put("deletedAt", LocalDateTime.now());
        return logAction(Actions.POST_FILE_DELETED, postId, null, details);
    }

    /**
     * Logs específicos para Reposts
     */
    @Override
    public ModerationLog logRepostCreated(UUID repostId, UUID postId, Map<String, Object> details) {
        details.put("originalPostId", postId);
        return logAction(Actions.REPOST_CREATED, postId, repostId, details);
    }

    @Override
    public ModerationLog logRepostDeleted(UUID repostId, UUID postId, Map<String, Object> details) {
        return logAction(Actions.REPOST_DELETED, postId, repostId, details);
    }

    /**
     * Logs para usuarios
     */
    @Override
    public ModerationLog logUserCreated(UUID userId, String username, String role, UUID createdByUserId) {
        Map<String, Object> details = new HashMap<>();
        details.put("createtBy", createdByUserId);
        details.put("username", username);
        details.put("role", role);
        details.put("createdAt", LocalDateTime.now());
        return logAction(Actions.USER_CREATED, null, null, details);
    }

    @Override
    public ModerationLog logUserDeleted(UUID userId, String username) {
        Map<String, Object> details = new HashMap<>();
        details.put("deletedUserId", userId);
        details.put("deletedUsername", username);
        details.put("deletedAt", LocalDateTime.now());
        return logAction(Actions.USER_DELETED, null, null, details);
    }

    @Override
    public ModerationLog logRoleChanged(UUID adminId, UUID targetUserId, String oldRole, String newRole) {
        //Obtener el admin que realizó el cambio
        AdminUser adminUser = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        //Crear detalles del cambio
        Map<String, Object> details = new HashMap<>();
        details.put("targetUserId", targetUserId);
        details.put("oldRole", oldRole);
        details.put("newRole", newRole);
        details.put("changedAt", LocalDateTime.now());

        //Crear log usando el método genérico que ya tienes
        return logAction(Actions.USER_ROLE_CHANGED, null, null, details);
    }

    @Override
    public Long countByAdminId(UUID adminId) {
        return moderationLogRepository.countByAdminUserId(adminId);
    }

    @Override
    public long countAllLogs() {
        return moderationLogRepository.count();
    }

    @Override
    public long countDistinctAdmins() {
        return moderationLogRepository.countDistinctAdmins();
    }

    @Override
    public long countPostsAffected() {
        return moderationLogRepository.countPostsAffected();
    }

    @Override
    public long countRepostsAffected() {
        return moderationLogRepository.countRepostsAffected();
    }

    /**
     * Métodos de consulta
     */
    @Override
    public Page<ModerationLog> getLogsByAdmin(UUID adminId, Pageable pageable) {
        return moderationLogRepository.findByAdminUserId(adminId, pageable);
    }

    @Override
    public Page<ModerationLog> getLogsByPost(UUID postId, Pageable pageable) {
        return moderationLogRepository.findByPostId(postId, pageable);
    }

    @Override
    public Page<ModerationLog> getLogsByAction(Actions action, Pageable pageable) {
        return moderationLogRepository.findByAction(action, pageable);
    }

    @Override
    public Page<ModerationLog> getLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return moderationLogRepository.findByDateRange(startDate, endDate, pageable);
    }

    @Override
    public Page<ModerationLog> getAllLogs(Pageable pageable) {
        return moderationLogRepository.findAll(pageable);
    }
}