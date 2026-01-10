package com.alexander.spring.r_chan.r_chan.controllers.moderator;

import com.alexander.spring.r_chan.r_chan.dtos.moderation.ADMINCreateRePostDTO;
import com.alexander.spring.r_chan.r_chan.dtos.publications.RePostDTO;
import com.alexander.spring.r_chan.r_chan.entity.Post;
import com.alexander.spring.r_chan.r_chan.entity.RePost;
import com.alexander.spring.r_chan.r_chan.services.moderation.logs.ModerationLogService;
import com.alexander.spring.r_chan.r_chan.services.publications.PostService;
import com.alexander.spring.r_chan.r_chan.services.publications.RePostService;
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
@RequestMapping("/moderator/api/repost")
public class RePostControllerModerator {

    @Autowired
    private Validator validator;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private RePostService rePostService;

    @Autowired
    private PostService postService;

    @Autowired
    private ModerationLogService moderationLogService;

    @GetMapping
    public ResponseEntity<Page<RePostDTO>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sort){
        Pageable pageable = PageRequest.of(page,size, Sort.by(sort).descending());
        return ResponseEntity.ok(rePostService.findAll(pageable));
    }

    @GetMapping("/id")
    public ResponseEntity<?> findById(@RequestParam(value = "id") UUID id){
        return ResponseEntity.ok(rePostService.findById(id));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<Page<RePostDTO>> findByPostId(
            @PathVariable UUID postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "createdDate") String sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort).descending());
        return ResponseEntity.ok(rePostService.findByPostId(postId, pageable));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> save(@RequestPart(value = "postData") String postDataJson,
                                  @RequestPart(value = "file", required = false) MultipartFile file){

        ObjectMapper objectMapper = new ObjectMapper();
        ADMINCreateRePostDTO adminCreateRePostDTO;

        try {
            adminCreateRePostDTO = objectMapper.readValue(postDataJson, ADMINCreateRePostDTO.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validacion manual uzando en validador de SPRING
        Set<ConstraintViolation<ADMINCreateRePostDTO>> violations = validator.validate(adminCreateRePostDTO);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<ADMINCreateRePostDTO> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        RePost rePost = new RePost();
        Post post = postService.findByIdE(adminCreateRePostDTO.getPostId());
        rePost.setPost(post);
        rePost.setContent(adminCreateRePostDTO.getContent());

        try {
            if(file != null){
                String fileName = fileStorageService.saveFile(file);
                rePost.setFileUrl(fileName);
                rePost.setFileType(fileStorageService.extractExtension(fileName));
            }
        } catch (IOException e) {
            throw new RuntimeException("Exception during upload",e);
        }

        RePostDTO savedRePost = rePostService.saveRePost(rePost);

        //Registrar acción de creación de repost
        Map<String, Object> details = new HashMap<>();
        details.put("repostId", savedRePost.getId());
        details.put("postId", savedRePost.getPost().getId());
        details.put("content", savedRePost.getContent());
        if (file != null) {
            details.put("fileUrl", savedRePost.getFileUrl());
            details.put("fileType", savedRePost.getFileType());
        }
        moderationLogService.logRepostCreated(savedRePost.getId(), savedRePost.getPost().getId(), details);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedRePost);
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> update(@RequestParam(value = "id") UUID id,
                                    @RequestPart(value = "postData") String postDataJson){

        ObjectMapper objectMapper = new ObjectMapper();
        ADMINCreateRePostDTO adminCreateRePostDTO;

        try {
            adminCreateRePostDTO = objectMapper.readValue(postDataJson, ADMINCreateRePostDTO.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validacion manual uzando en validador de SPRING
        Set<ConstraintViolation<ADMINCreateRePostDTO>> violations = validator.validate(adminCreateRePostDTO);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<ADMINCreateRePostDTO> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        //Obtener el repost antiguo para comparar
        RePost oldRePost = rePostService.findByIdE(id);

        //Crear objeto con las actualizaciones
        RePost repostUpdates = new RePost();
        repostUpdates.setApprovalStatus(adminCreateRePostDTO.getApprovalStatus());

        if (adminCreateRePostDTO.getFileStatus() != null) {
            repostUpdates.setFileStatus(adminCreateRePostDTO.getFileStatus());
        }

        Post post = postService.findByIdE(adminCreateRePostDTO.getPostId());
        repostUpdates.setPost(post);
        repostUpdates.setContent(adminCreateRePostDTO.getContent());
        //Mantener el archivo existente si no se proporciona uno nuevo
        repostUpdates.setFileUrl(oldRePost.getFileUrl());
        repostUpdates.setFileType(oldRePost.getFileType());

        //Registrar acción de actualización de repost
        Map<String, Object> oldValues = new HashMap<>();
        oldValues.put("content", oldRePost.getContent());
        oldValues.put("postId", oldRePost.getPost().getId());
        oldValues.put("fileUrl", oldRePost.getFileUrl());
        oldValues.put("fileType", oldRePost.getFileType());
        oldValues.put("approvalStatus", oldRePost.getApprovalStatus() != null ?
                oldRePost.getApprovalStatus().toString() : null);
        oldValues.put("fileStatus", oldRePost.getFileStatus() != null ?
                oldRePost.getFileStatus().toString() : null);

        //Actualizar y obtener el repost actualizado
        RePostDTO updatedRePostDTO = rePostService.updateRePost(id, repostUpdates);
        RePost updatedRePostEntity = rePostService.findByIdE(id);

        Map<String, Object> newValues = new HashMap<>();
        newValues.put("content", updatedRePostEntity.getContent());
        newValues.put("postId", updatedRePostEntity.getPost().getId());
        newValues.put("fileUrl", updatedRePostEntity.getFileUrl());
        newValues.put("fileType", updatedRePostEntity.getFileType());
        newValues.put("approvalStatus", updatedRePostEntity.getApprovalStatus() != null ?
                updatedRePostEntity.getApprovalStatus().toString() : null);
        newValues.put("fileStatus", updatedRePostEntity.getFileStatus() != null ?
                updatedRePostEntity.getFileStatus().toString() : null);

        Map<String, Object> changes = new HashMap<>();
        changes.put("old", oldValues);
        changes.put("new", newValues);

        moderationLogService.logAction(com.alexander.spring.r_chan.r_chan.enums.Actions.REPOST_UPDATED,
                updatedRePostEntity.getPost().getId(), updatedRePostEntity.getId(), changes);

        return ResponseEntity.ok(updatedRePostDTO);
    }

    @DeleteMapping
    public ResponseEntity<?> delete(@RequestParam(value = "id") UUID id){
        //Obtener el repost antes de eliminarlo para registrar detalles
        RePost rePost = rePostService.findByIdE(id);

        //Registrar acción de eliminación de repost
        Map<String, Object> details = new HashMap<>();
        details.put("repostId", id);
        details.put("postId", rePost.getPost().getId());
        details.put("content", rePost.getContent());
        details.put("fileUrl", rePost.getFileUrl());
        details.put("fileType", rePost.getFileType());

        moderationLogService.logRepostDeleted(id, rePost.getPost().getId(), details);

        rePostService.delete(id);

        return ResponseEntity.ok().build();
    }

}