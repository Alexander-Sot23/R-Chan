package com.alexander.spring.r_chan.r_chan.controllers;

import com.alexander.spring.r_chan.r_chan.dtos.publications.CreatePostDTO;
import com.alexander.spring.r_chan.r_chan.dtos.publications.PostDTO;
import com.alexander.spring.r_chan.r_chan.entity.Post;
import com.alexander.spring.r_chan.r_chan.enums.SectionEnum;
import com.alexander.spring.r_chan.r_chan.repository.SectionRepository;
import com.alexander.spring.r_chan.r_chan.services.storage.FileStorageService;
import com.alexander.spring.r_chan.r_chan.services.publications.PostService;
import com.alexander.spring.r_chan.r_chan.services.publications.sections.SectionService;
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
@RequestMapping("/api/post")
public class PostController {

    @Autowired
    private Validator validator;

    @Autowired
    private PostService postService;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private SectionService sectionService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<Page<PostDTO>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sort,
            @RequestParam(required = false) SectionEnum sectionType){ //Cambiar a sectionType

        Pageable pageable = PageRequest.of(page, size, Sort.by(sort).descending());

        if (sectionType != null) {
            return ResponseEntity.ok(postService.findBySectionType(sectionType, pageable)); //Usar el método correcto
        }

        return ResponseEntity.ok(postService.findAllApproved(pageable));
    }

    @GetMapping("/id")
    public ResponseEntity<?> findById(@RequestParam(value = "id") UUID id){
        return ResponseEntity.ok(postService.findById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> save(
            @RequestPart(value = "postData") String postDataJson,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        ObjectMapper objectMapper = new ObjectMapper();
        CreatePostDTO createPostDTO;

        try {
            createPostDTO = objectMapper.readValue(postDataJson, CreatePostDTO.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validación manual usando el validador de SPRING
        Set<ConstraintViolation<CreatePostDTO>> violations = validator.validate(createPostDTO);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<CreatePostDTO> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        Post post = new Post();
        post.setTitle(createPostDTO.getTitle());
        post.setContent(createPostDTO.getContent());

        SectionEnum sectionEnum = createPostDTO.getSectionType();
        com.alexander.spring.r_chan.r_chan.entity.Section sectionDB = sectionService.findBySectionType(sectionEnum);

        try {
            if (file != null) {
                String fileName = fileStorageService.saveFile(file);
                post.setFileUrl(fileName);
                post.setFileType(fileStorageService.extractExtension(fileName));
            }
        } catch (IOException e) {
            throw new RuntimeException("Exception during upload", e);
        }

        //Incrementar el contador de posts en la sección
        sectionService.incrementPostCount(sectionDB.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(postService.savePostWithoutLog(post));
    }

}
