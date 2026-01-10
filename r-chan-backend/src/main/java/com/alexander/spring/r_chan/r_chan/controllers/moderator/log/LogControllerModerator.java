package com.alexander.spring.r_chan.r_chan.controllers.moderator.log;

import com.alexander.spring.r_chan.r_chan.dtos.moderation.ModerationLogDTO;
import com.alexander.spring.r_chan.r_chan.entity.ModerationLog;
import com.alexander.spring.r_chan.r_chan.services.moderation.logs.ModerationLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/moderator/api/logs")
public class LogControllerModerator {

    @Autowired
    private ModerationLogService moderationLogService;

    @GetMapping("/stats/moderator")
    public ResponseEntity<Map<String, Object>> getModeratorStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogs", moderationLogService.countAllLogs());
        stats.put("message", "Estadísticas para moderadores");

        return ResponseEntity.ok(stats);
    }

    @GetMapping
    public ResponseEntity<Page<ModerationLogDTO>> getModeratorLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ModerationLog> logs = moderationLogService.getAllLogs(pageable);
        Page<ModerationLogDTO> logDTOs = logs.map(ModerationLogDTO::new);

        return ResponseEntity.ok(logDTOs);
    }
}