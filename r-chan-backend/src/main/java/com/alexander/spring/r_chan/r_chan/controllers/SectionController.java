package com.alexander.spring.r_chan.r_chan.controllers;

import com.alexander.spring.r_chan.r_chan.dtos.publications.SectionDTO;
import com.alexander.spring.r_chan.r_chan.services.publications.sections.SectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/section")
public class SectionController {

    @Autowired
    private SectionService sectionService;

    @GetMapping
    public ResponseEntity<Page<SectionDTO>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "postCount") String sort){
        Pageable pageable = PageRequest.of(page,size, Sort.by(sort).descending());
        return ResponseEntity.ok(sectionService.findAll(pageable));
    }

    @GetMapping("/id")
    public ResponseEntity<?> findById(@RequestParam(value = "id") UUID id){
        return ResponseEntity.ok(sectionService.findById(id));
    }
}
