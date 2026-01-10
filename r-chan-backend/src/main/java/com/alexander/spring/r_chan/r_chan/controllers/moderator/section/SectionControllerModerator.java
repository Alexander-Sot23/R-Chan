package com.alexander.spring.r_chan.r_chan.controllers.moderator.section;

import com.alexander.spring.r_chan.r_chan.dtos.publications.SectionDTO;
import com.alexander.spring.r_chan.r_chan.enums.SectionEnum;
import com.alexander.spring.r_chan.r_chan.enums.SectionStatus;
import com.alexander.spring.r_chan.r_chan.services.publications.sections.SectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/moderator/api/sections")
public class SectionControllerModerator {

    @Autowired
    private SectionService sectionService;

    @GetMapping
    public ResponseEntity<Page<SectionDTO>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "sectionType") String sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort).ascending());
        return ResponseEntity.ok(sectionService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(sectionService.findById(id));
    }

    @GetMapping("/type/{sectionType}")
    public ResponseEntity<?> findBySectionType(@PathVariable SectionEnum sectionEnumType) {
        return ResponseEntity.ok(sectionService.findBySectionType(sectionEnumType));
    }

    @GetMapping("/available-types")
    public ResponseEntity<List<SectionEnum>> getAvailableSectionTypes() {
        List<SectionEnum> sectionEnumTypes = Arrays.asList(SectionEnum.values());
        return ResponseEntity.ok(sectionEnumTypes);
    }

    @GetMapping("/active")
    public ResponseEntity<List<SectionDTO>> getActiveSections() {
        Page<SectionDTO> allSections = sectionService.findAll(PageRequest.of(0, 100, Sort.by("sectionType").ascending()));
        List<SectionDTO> activeSections = allSections.getContent().stream()
                .filter(section -> section.getStatus() == SectionStatus.ACTIVED)
                .collect(Collectors.toList());
        return ResponseEntity.ok(activeSections);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable UUID id, @RequestParam SectionStatus status) {
        return ResponseEntity.ok(sectionService.updateSectionStatus(id, status));
    }

    @PostMapping("/initialize")
    public ResponseEntity<?> initializeSections() {
        return ResponseEntity.ok("Sections initialized");
    }
}