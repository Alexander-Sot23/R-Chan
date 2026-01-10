package com.alexander.spring.r_chan.r_chan.controllers.moderator;

import com.alexander.spring.r_chan.r_chan.dtos.moderation.ADMINCreatePostDTO;
import com.alexander.spring.r_chan.r_chan.dtos.publications.PostDTO;
import com.alexander.spring.r_chan.r_chan.entity.Post;
import com.alexander.spring.r_chan.r_chan.entity.Section;
import com.alexander.spring.r_chan.r_chan.enums.SectionEnum;
import com.alexander.spring.r_chan.r_chan.services.moderation.logs.ModerationLogService;
import com.alexander.spring.r_chan.r_chan.services.publications.PostService;
import com.alexander.spring.r_chan.r_chan.services.publications.sections.SectionService;
import com.alexander.spring.r_chan.r_chan.services.storage.FileStorageService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/moderator/api/post")
public class PostControllerModerator {

    @Autowired
    private Validator validator;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private PostService postService;

    @Autowired
    private SectionService sectionService;

    @Autowired
    private ModerationLogService moderationLogService;

    @GetMapping
    public ResponseEntity<Page<PostDTO>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort).descending());
        return ResponseEntity.ok(postService.findAll(pageable));
    }

    @GetMapping("/id")
    public ResponseEntity<?> findById(@RequestParam(value = "id") UUID id) {
        return ResponseEntity.ok(postService.findById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> save(
            @RequestPart(value = "postData") String postDataJson,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        ObjectMapper objectMapper = new ObjectMapper();
        ADMINCreatePostDTO adminCreatePostDTO;

        try {
            adminCreatePostDTO = objectMapper.readValue(postDataJson, ADMINCreatePostDTO.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validacion manual uzando en validador de SPRING
        Set<ConstraintViolation<ADMINCreatePostDTO>> violations = validator.validate(adminCreatePostDTO);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<ADMINCreatePostDTO> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        Post post = new Post();

        post.setTitle(adminCreatePostDTO.getTitle());
        post.setContent(adminCreatePostDTO.getContent());
        post.setFileStatus(adminCreatePostDTO.getFileStatus());
        post.setApprovalStatus(adminCreatePostDTO.getApprovalStatus());

        SectionEnum sectionEnum = SectionEnum.valueOf(adminCreatePostDTO.getSectionType().getDisplayName());
        com.alexander.spring.r_chan.r_chan.entity.Section sectionDB = sectionService.findBySectionType(sectionEnum);
        post.setSection(sectionDB);

        try {
            if(file != null){
                String fileName = fileStorageService.saveFile(file);
                post.setFileUrl(fileName);
                post.setFileType(fileStorageService.extractExtension(fileName));
            }
        } catch (IOException e) {
            throw new RuntimeException("Exception during upload",e);
        }

        PostDTO savedPost = postService.savePost(post);

        //Registrar acción de creación de post
        Map<String, Object> details = new HashMap<>();
        details.put("postId", savedPost.getId());
        details.put("title", savedPost.getTitle());
        details.put("content", savedPost.getContent());
        details.put("section", post.getSection().getSectionType());
        details.put("fileStatus", savedPost.getFileStatus().toString());
        details.put("approvalStatus", savedPost.getApprovalStatus().toString());
        if (file != null) {
            details.put("fileUrl", savedPost.getFileUrl());
            details.put("fileType", savedPost.getFileType());
        }

        //Incrementar el contador de posts en la sección
        sectionService.incrementPostCount(sectionDB.getId());

        moderationLogService.logPostCreated(savedPost.getId(), details);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> update(@RequestParam(value = "id") UUID id,
                                    @RequestPart(value = "postData") String postDataJson) {

        ObjectMapper objectMapper = new ObjectMapper();
        ADMINCreatePostDTO adminCreatePostDTO;

        try {
            adminCreatePostDTO = objectMapper.readValue(postDataJson, ADMINCreatePostDTO.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validacion manual uzando en validador de SPRING
        Set<ConstraintViolation<ADMINCreatePostDTO>> violations = validator.validate(adminCreatePostDTO);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<ADMINCreatePostDTO> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        //Obtener el post antiguo para comparar
        Post oldPost = postService.findByIdE(id);

        Post post = new Post();

        SectionEnum sectionEnum = adminCreatePostDTO.getSectionType();
        Section sectionDB = sectionService.findBySectionType(sectionEnum);

        post.setTitle(adminCreatePostDTO.getTitle());
        post.setSection(sectionDB);
        post.setContent(adminCreatePostDTO.getContent());
        post.setFileStatus(adminCreatePostDTO.getFileStatus());
        post.setApprovalStatus(adminCreatePostDTO.getApprovalStatus());

        PostDTO updatedPost = postService.updatePost(id, post);

        //Registrar acción de actualización de post
        Map<String, Object> oldValues = new HashMap<>();
        oldValues.put("title", oldPost.getTitle());
        oldValues.put("content", oldPost.getContent());
        oldValues.put("fileStatus", oldPost.getFileStatus().toString());
        oldValues.put("approvalStatus", oldPost.getApprovalStatus().toString());
        oldValues.put("fileUrl", oldPost.getFileUrl());
        oldValues.put("section", post.getSection().getSectionType());
        oldValues.put("fileType", oldPost.getFileType());

        Map<String, Object> newValues = new HashMap<>();
        newValues.put("title", updatedPost.getTitle());
        newValues.put("content", updatedPost.getContent());
        newValues.put("section", post.getSection().getSectionType());
        newValues.put("fileStatus", updatedPost.getFileStatus().toString());
        newValues.put("approvalStatus", updatedPost.getApprovalStatus().toString());
        newValues.put("fileUrl", updatedPost.getFileUrl());
        newValues.put("fileType", updatedPost.getFileType());

        //Incrementar el contador de posts en la sección
        sectionService.incrementPostCount(sectionDB.getId());

        moderationLogService.logPostUpdated(updatedPost.getId(), oldValues, newValues);

        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping
    public ResponseEntity<?> delete(@RequestParam(value = "id") UUID id) {
        //Obtener el post antes de eliminarlo para registrar detalles
        Post post = postService.findByIdE(id);

        //Registrar acción de eliminación de post
        Map<String, Object> details = new HashMap<>();
        details.put("postId", id);
        details.put("title", post.getTitle());
        details.put("content", post.getContent());
        details.put("section", post.getSection().getSectionType());
        details.put("fileUrl", post.getFileUrl());
        details.put("fileType", post.getFileType());

        moderationLogService.logPostDeleted(id, details);

        postService.delete(id);

        return ResponseEntity.ok().build();
    }

}