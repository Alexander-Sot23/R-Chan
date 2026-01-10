package com.alexander.spring.r_chan.r_chan.services.publications;

import com.alexander.spring.r_chan.r_chan.dtos.publications.PostDTO;
import com.alexander.spring.r_chan.r_chan.enums.ApprovalStatus;
import com.alexander.spring.r_chan.r_chan.enums.FileStatus;
import com.alexander.spring.r_chan.r_chan.entity.Post;
import com.alexander.spring.r_chan.r_chan.enums.SectionEnum;
import com.alexander.spring.r_chan.r_chan.exceptions.PostNotFoundException;
import com.alexander.spring.r_chan.r_chan.repository.PostRepository;
import com.alexander.spring.r_chan.r_chan.repository.SectionRepository;
import com.alexander.spring.r_chan.r_chan.services.moderation.auto_validation.ContentValidationService;
import com.alexander.spring.r_chan.r_chan.services.publications.sections.SectionService;
import com.alexander.spring.r_chan.r_chan.services.storage.FileStorageServiceImpl;
import com.alexander.spring.r_chan.r_chan.services.moderation.logs.ModerationLogService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class PostServiceImpl implements PostService{

    @Autowired
    private SectionService sectionService;

    @Autowired
    private FileStorageServiceImpl fileStorageServiceImpl;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private ContentValidationService contentValidationService;

    @Autowired
    private ModerationLogService moderationLogService;

    @Override
    public Page<PostDTO> findAll(Pageable pageable) {
        return postRepository.findAll(pageable).map(PostDTO::new);
    }

    @Override
    public Page<PostDTO> findAllApproved(Pageable pageable) {
        return postRepository.findAllApproved(
                Arrays.asList(ApprovalStatus.APPROVED, ApprovalStatus.AUTO_APPROVED),
                pageable
        ).map(PostDTO::new);
    }

    @Override
    public PostDTO findById(UUID id) {
        return new PostDTO(postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id)));
    }

    @Override
    public Post findByIdE(UUID id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
    }

    @Override
    public Page<PostDTO> findBySectionType(SectionEnum sectionEnumType, Pageable pageable) {
        return postRepository.findBySection_SectionTypeAndApprovalStatusIn(
                sectionEnumType,
                Arrays.asList(ApprovalStatus.APPROVED, ApprovalStatus.AUTO_APPROVED),
                pageable
        ).map(PostDTO::new);
    }

    @Override
    public PostDTO savePost(Post post) {
        if (hasFile(post)) {
            post.setApprovalStatus(ApprovalStatus.PENDING);
        } else {
            if (contentValidationService.containsRestrictedWords(post.getContent())) {
                post.setApprovalStatus(ApprovalStatus.PENDING);
            } else {
                post.setApprovalStatus(ApprovalStatus.AUTO_APPROVED);
                post.setFileStatus(FileStatus.UNKNOWN);
            }
        }

        //Si no se especifica una sección, lo agregamos a la sección predeterminada
        if (post.getSection() == null) {
            com.alexander.spring.r_chan.r_chan.entity.Section section = sectionRepository.findBySectionType(SectionEnum.GENERAL)
                    .orElseThrow(() -> new RuntimeException("Section with name: " + SectionEnum.GENERAL + ", not found."));
            section.setPostCount(section.getPostCount() + 1);
            sectionRepository.save(section);
            post.setSection(section);
        } else {
            //Aumentamos la cantidad de post en su respectiva section
            var postSection = post.getSection();
            postSection.setPostCount(postSection.getPostCount() + 1);
            sectionRepository.save(postSection);
        }

        if (post.getReplyCount() == null) {
            post.setReplyCount(0);
        }

        if(post.getFileStatus() == null){
            post.setFileStatus(FileStatus.VISIBLE);
        }

        Post postS = postRepository.save(post);

        //Log de creación
        Map<String, Object> logDetails = new HashMap<>();
        logDetails.put("title", postS.getTitle());
        logDetails.put("section", postS.getSection().getSectionType());
        logDetails.put("approvalStatus", postS.getApprovalStatus().name());
        logDetails.put("hasFile", postS.getFileUrl() != null);

        moderationLogService.logPostCreated(postS.getId(), logDetails);

        return new PostDTO(postS);
    }

    @Override
    public PostDTO savePostWithoutLog(Post post) {
        if (hasFile(post)) {
            post.setApprovalStatus(ApprovalStatus.PENDING);
        } else {
            if (contentValidationService.containsRestrictedWords(post.getContent())) {
                post.setApprovalStatus(ApprovalStatus.PENDING);
            } else {
                post.setApprovalStatus(ApprovalStatus.AUTO_APPROVED);
                post.setFileStatus(FileStatus.UNKNOWN);
            }
        }

        //Si no se especifica una sección, lo agregamos a la sección predeterminada
        if (post.getSection() == null) {
            com.alexander.spring.r_chan.r_chan.entity.Section section = sectionRepository.findBySectionType(SectionEnum.GENERAL)
                    .orElseThrow(() -> new RuntimeException("Section with name: " + SectionEnum.GENERAL + ", not found."));
            section.setPostCount(section.getPostCount() + 1);
            sectionRepository.save(section);
            post.setSection(section);
        } else {
            //Aumentamos la cantidad de post en su respectiva section
            var postSection = post.getSection();
            postSection.setPostCount(postSection.getPostCount() + 1);
            sectionRepository.save(postSection);
        }

        if (post.getReplyCount() == null) {
            post.setReplyCount(0);
        }

        if(post.getFileStatus() == null){
            post.setFileStatus(FileStatus.VISIBLE);
        }

        return new PostDTO(postRepository.save(post));
    }

    @Override
    public PostDTO updatePost(UUID id, Post post) {
        Post postDB = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));

        //Capturar valores antiguos para el log
        Map<String, Object> oldValues = new HashMap<>();
        oldValues.put("title", postDB.getTitle());
        oldValues.put("content", postDB.getContent());
        oldValues.put("approvalStatus", postDB.getApprovalStatus());
        oldValues.put("fileStatus", postDB.getFileStatus());
        oldValues.put("section", postDB.getSection() != null ? postDB.getSection().getSectionType() : null);

        //Si se especifica una nueva sección
        if (post.getSection() != null) {
            com.alexander.spring.r_chan.r_chan.entity.Section newSection = sectionService.findByIdE(post.getSection().getId());
            com.alexander.spring.r_chan.r_chan.entity.Section oldSection = postDB.getSection();

            //Si es una sección diferente
            if (!newSection.getId().equals(oldSection.getId())) {
                //Disminuir contador de sección antigua
                oldSection.setPostCount(oldSection.getPostCount() - 1);
                sectionRepository.save(oldSection);

                //Aumentar contador de nueva sección
                newSection.setPostCount(newSection.getPostCount() + 1);
                sectionRepository.save(newSection);

                postDB.setSection(newSection);
            }
        }

        if (post.getReplyCount() == null) {
            post.setReplyCount(0);
        }

        if(post.getApprovalStatus() != null){
            postDB.setApprovalStatus(post.getApprovalStatus());
        }

        if(post.getFileStatus() != null){
            postDB.setFileStatus(post.getFileStatus());
        }

        if (postDB.getFileStatus() == FileStatus.DELETE) {
            try {
                fileStorageServiceImpl.deleteFile(postDB.getFileUrl());
                postDB.setFileUrl(null);
                postDB.setFileType(null);

                //Log de eliminación de archivo
                moderationLogService.logPostFileDeleted(id,
                        fileStorageServiceImpl.extractOriginalFilename(postDB.getFileUrl()),
                        postDB.getFileUrl());

            } catch (IOException e) {
                throw new RuntimeException("Error deleting file: " + e.getMessage());
            }
        }

        if (post.getTitle() != null) {
            postDB.setTitle(post.getTitle());
        }

        if (post.getContent() != null) {
            postDB.setContent(post.getContent());
        }

        Post postS = postRepository.save(postDB);

        //Log de actualización
        Map<String, Object> newValues = new HashMap<>();
        newValues.put("title", postS.getTitle());
        newValues.put("content", postS.getContent());
        newValues.put("approvalStatus", postS.getApprovalStatus());
        newValues.put("fileStatus", postS.getFileStatus());
        newValues.put("section", postS.getSection() != null ? postS.getSection().getSectionType() : null);

        moderationLogService.logPostUpdated(id, oldValues, newValues);

        return new PostDTO(postS);
    }

    @Override
    public void delete(UUID id) {
        Post postD = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));

        //Capturar datos para el log antes de eliminar
        Map<String, Object> postDetails = new HashMap<>();
        postDetails.put("title", postD.getTitle());
        postDetails.put("section", postD.getSection() != null ? postD.getSection().getSectionType() : null);
        postDetails.put("replyCount", postD.getReplyCount());
        postDetails.put("hasFile", postD.getFileUrl() != null);

        //Eliminar el archivo físico
        try {
            if (postD.getFileUrl() != null) {
                fileStorageServiceImpl.deleteFile(postD.getFileUrl());
            }
        } catch (IOException e) {
            throw new RuntimeException("Error deleting file: " + e.getMessage());
        }

        //Decrementar contador de la sección
        com.alexander.spring.r_chan.r_chan.entity.Section section = postD.getSection();
        section.setPostCount(section.getPostCount() - 1);
        sectionRepository.save(section);

        //Eliminar el post
        postRepository.delete(postD);

        //Log de eliminación
        moderationLogService.logPostDeleted(id, postDetails);
    }

    private boolean hasFile(Post post) {
        return post.getFileType() != null &&
                post.getFileUrl() != null &&
                !post.getFileUrl().isEmpty();
    }
}