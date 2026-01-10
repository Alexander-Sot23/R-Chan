package com.alexander.spring.r_chan.r_chan.controllers.moderator.admin;

import com.alexander.spring.r_chan.r_chan.dtos.moderation.ModerationLogDTO;
import com.alexander.spring.r_chan.r_chan.entity.ModerationLog;
import com.alexander.spring.r_chan.r_chan.enums.Actions;
import com.alexander.spring.r_chan.r_chan.repository.ModerationLogRepository;
import com.alexander.spring.r_chan.r_chan.services.moderation.logs.ModerationLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/api/logs")
public class LogControllerAdmin {

    @Autowired
    private ModerationLogService moderationLogService;

    @Autowired
    private ModerationLogRepository moderationLogRepository;

    @GetMapping
    public ResponseEntity<Page<ModerationLogDTO>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("ASC") ?
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        Page<ModerationLog> logs = moderationLogService.getAllLogs(pageable);
        Page<ModerationLogDTO> logDTOs = logs.map(ModerationLogDTO::new);

        return ResponseEntity.ok(logDTOs);
    }

    @GetMapping("/admin")
    public ResponseEntity<Page<ModerationLogDTO>> getLogsByAdmin(
            @RequestParam(value = "id") UUID adminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ModerationLog> logs = moderationLogService.getLogsByAdmin(adminId, pageable);
        Page<ModerationLogDTO> logDTOs = logs.map(ModerationLogDTO::new);

        return ResponseEntity.ok(logDTOs);
    }

    @GetMapping("/post")
    public ResponseEntity<Page<ModerationLogDTO>> getLogsByPost(
            @RequestParam(value = "id") UUID postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ModerationLog> logs = moderationLogService.getLogsByPost(postId, pageable);
        Page<ModerationLogDTO> logDTOs = logs.map(ModerationLogDTO::new);

        return ResponseEntity.ok(logDTOs);
    }

    @GetMapping("/action")
    public ResponseEntity<Page<ModerationLogDTO>> getLogsByAction(
            @RequestParam(value = "action") Actions action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ModerationLog> logs = moderationLogService.getLogsByAction(action, pageable);
        Page<ModerationLogDTO> logDTOs = logs.map(ModerationLogDTO::new);

        return ResponseEntity.ok(logDTOs);
    }

    @GetMapping("/date-range")
    public ResponseEntity<Page<ModerationLogDTO>> getLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ModerationLog> logs = moderationLogService.getLogsByDateRange(startDate, endDate, pageable);
        Page<ModerationLogDTO> logDTOs = logs.map(ModerationLogDTO::new);

        return ResponseEntity.ok(logDTOs);
    }

    @GetMapping("/stats/admin")
    public ResponseEntity<Map<String, Object>> getAdminStats(@RequestParam(value = "id") UUID adminId) {
        Long totalActions = moderationLogService.countByAdminId(adminId);

        //Agregar estadísticas adicionales
        Long postsModerated = moderationLogRepository.countPostsByAdminId(adminId);
        Long repostsModerated = moderationLogRepository.countRepostsByAdminId(adminId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("adminId", adminId);
        stats.put("totalActions", totalActions);
        stats.put("postsModerated", postsModerated);
        stats.put("repostsModerated", repostsModerated);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/global")
    public ResponseEntity<Map<String, Object>> getGlobalStats() {
        long totalLogs = moderationLogService.countAllLogs();
        long totalAdmins = moderationLogService.countDistinctAdmins();
        long totalPostsAffected = moderationLogService.countPostsAffected();
        long totalRepostsAffected = moderationLogService.countRepostsAffected();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogs", totalLogs);
        stats.put("totalAdmins", totalAdmins);
        stats.put("totalPostsAffected", totalPostsAffected);
        stats.put("totalRepostsAffected", totalRepostsAffected);

        return ResponseEntity.ok(stats);
    }
}