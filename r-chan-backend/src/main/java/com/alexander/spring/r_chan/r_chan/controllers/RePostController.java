package com.alexander.spring.r_chan.r_chan.controllers;

import com.alexander.spring.r_chan.r_chan.dtos.publications.CreateRePostDTO;
import com.alexander.spring.r_chan.r_chan.dtos.publications.RePostDTO;
import com.alexander.spring.r_chan.r_chan.entity.Post;
import com.alexander.spring.r_chan.r_chan.entity.RePost;
import com.alexander.spring.r_chan.r_chan.enums.ApprovalStatus;
import com.alexander.spring.r_chan.r_chan.repository.RePostRepository;
import com.alexander.spring.r_chan.r_chan.services.storage.FileStorageService;
import com.alexander.spring.r_chan.r_chan.services.publications.PostService;
import com.alexander.spring.r_chan.r_chan.services.publications.RePostService;
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
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/repost")
public class RePostController {

    @Autowired
    private Validator validator;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private RePostService rePostService;

    @Autowired
    private PostService postService;

    @Autowired
    private RePostRepository rePostRepository;

    @GetMapping
    public ResponseEntity<Page<RePostDTO>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sort) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sort).descending());
        return ResponseEntity.ok(rePostService.findAllApproved(pageable));
    }

    @GetMapping("/post/id")
    public List<RePostDTO> findByPostId(@RequestParam(value = "id") UUID postId) {
        //Busca todos los reposts donde el post.id = postId Y approval_status IN (APPROVED, AUTO_APPROVED)
        List<RePost> reposts = rePostRepository.findByPost_IdAndApprovalStatusIn(
                postId,
                Arrays.asList(ApprovalStatus.APPROVED, ApprovalStatus.AUTO_APPROVED)
        );

        //Si no hay reposts, devuelve una lista vacía, NO lanza excepción
        if (reposts.isEmpty()) {
            return Collections.emptyList();
        }

        return reposts.stream()
                .map(RePostDTO::new)
                .collect(Collectors.toList());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> save(@RequestPart(value = "postData") String postDataJson,
                                  @RequestPart(value = "file", required = false) MultipartFile file){

        ObjectMapper objectMapper = new ObjectMapper();
        CreateRePostDTO createRePostDTO;

        try {
            createRePostDTO = objectMapper.readValue(postDataJson, CreateRePostDTO.class);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid JSON format: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        //Validacion manual uzando en validador de SPRING
        Set<ConstraintViolation<CreateRePostDTO>> violations = validator.validate(createRePostDTO);
        if (!violations.isEmpty()) {
            Map<String, String> errors = new HashMap<>();
            for (ConstraintViolation<CreateRePostDTO> violation : violations) {
                errors.put(violation.getPropertyPath().toString(), violation.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        RePost rePost = new RePost();
        Post post = postService.findByIdE(createRePostDTO.getPostId());
        rePost.setPost(post);
        rePost.setContent(createRePostDTO.getContent());

        try {
            if(file != null){
                String fileName = fileStorageService.saveFile(file);
                rePost.setFileUrl(fileName);
                rePost.setFileType(fileStorageService.extractExtension(fileName));
            }
        } catch (IOException e) {
            throw new RuntimeException("Exception during upload",e);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(rePostService.saveRePost(rePost));
    }
}
