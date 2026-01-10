package com.alexander.spring.r_chan.r_chan.services.publications;

import com.alexander.spring.r_chan.r_chan.dtos.publications.RePostDTO;
import com.alexander.spring.r_chan.r_chan.enums.ApprovalStatus;
import com.alexander.spring.r_chan.r_chan.enums.FileStatus;
import com.alexander.spring.r_chan.r_chan.entity.RePost;
import com.alexander.spring.r_chan.r_chan.exceptions.RePostNotFoundException;
import com.alexander.spring.r_chan.r_chan.repository.PostRepository;
import com.alexander.spring.r_chan.r_chan.repository.RePostRepository;
import com.alexander.spring.r_chan.r_chan.services.moderation.auto_validation.ContentValidationService;
import com.alexander.spring.r_chan.r_chan.services.storage.FileStorageServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Arrays;
import java.util.UUID;

@Service
@Transactional
public class RePostServiceImpl implements RePostService {

    @Autowired
    private RePostRepository rePostRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private FileStorageServiceImpl fileStorageServiceImpl;

    @Autowired
    private ContentValidationService contentValidationService;

    @Override
    public Page<RePostDTO> findAll(Pageable pageable) {
        return rePostRepository.findAll(pageable).map(RePostDTO::new);
    }

    @Override
    public Page<RePostDTO> findAllApproved(Pageable pageable) {
        return rePostRepository.findAllApproved(
                Arrays.asList(ApprovalStatus.APPROVED, ApprovalStatus.AUTO_APPROVED),
                pageable
        ).map(RePostDTO::new);
    }

    @Override
    public RePostDTO findById(UUID id) {
        RePost rePostDB = rePostRepository.findById(id)
                .orElseThrow(() -> new RePostNotFoundException(id));
        return new RePostDTO(rePostDB);
    }

    @Override
    public RePostDTO findByPostId(UUID id) {
        RePost rePostDB = rePostRepository.findByPostId(id)
                .orElseThrow(() -> new RePostNotFoundException(id));
        return new RePostDTO(rePostDB);
    }

    @Override
    public Page<RePostDTO> findByPostId(UUID postId, Pageable pageable) {
        return rePostRepository.findByPostId(postId, pageable).map(RePostDTO::new);
    }

    @Override
    public RePost findByIdE(UUID id) {
        return rePostRepository.findById(id)
                .orElseThrow(() -> new RePostNotFoundException(id));
    }

    @Override
    public RePostDTO saveRePost(RePost rePost) {
        if (hasFile(rePost)) {
            rePost.setApprovalStatus(ApprovalStatus.PENDING);
        } else {
            if (contentValidationService.containsRestrictedWords(rePost.getContent())) {
                rePost.setApprovalStatus(ApprovalStatus.PENDING);
            } else {
                rePost.setApprovalStatus(ApprovalStatus.AUTO_APPROVED);
                rePost.setFileStatus(FileStatus.UNKNOWN);
            }
        }

        if (rePost.getFileStatus() == null) {
            rePost.setFileStatus(FileStatus.VISIBLE);
        }

        var post = rePost.getPost();
        post.setReplyCount(post.getReplyCount() + 1);
        postRepository.save(post);

        RePost rePostS = rePostRepository.save(rePost);
        return new RePostDTO(rePostS);
    }

    public RePostDTO updateRePost(UUID id, RePost repostUpdates) {
        RePost existingRePost = rePostRepository.findById(id)
                .orElseThrow(() -> new RePostNotFoundException(id));

        //Aplicar actualizaciones
        if (repostUpdates.getPost() != null) {
            existingRePost.setPost(repostUpdates.getPost());
        }
        if (repostUpdates.getContent() != null) {
            existingRePost.setContent(repostUpdates.getContent());
        }
        if (repostUpdates.getFileUrl() != null) {
            existingRePost.setFileUrl(repostUpdates.getFileUrl());
        }
        if (repostUpdates.getFileType() != null) {
            existingRePost.setFileType(repostUpdates.getFileType());
        }
        if (repostUpdates.getApprovalStatus() != null) {
            existingRePost.setApprovalStatus(repostUpdates.getApprovalStatus());
        }
        if (repostUpdates.getFileStatus() != null) {
            existingRePost.setFileStatus(repostUpdates.getFileStatus());
        }

        RePost updated = rePostRepository.save(existingRePost);
        return new RePostDTO(updated);
    }

    @Override
    public void delete(UUID id) {
        RePost rePostDB = rePostRepository.findById(id)
                .orElseThrow(() -> new RePostNotFoundException(id));

        var post = rePostDB.getPost();
        post.setReplyCount(post.getReplyCount() - 1);
        postRepository.save(post);

        if (rePostDB.getFileUrl() != null) {
            try {
                fileStorageServiceImpl.deleteFile(rePostDB.getFileUrl());
            } catch (IOException e) {
                throw new RuntimeException("Error al eliminar el archivo: " + e.getMessage());
            }
        }

        rePostRepository.delete(rePostDB);
    }

    /**
     * Determina si el re-post tiene un archivo asociado.
     * @param rePost El re-post a verificar.
     * @return true si tiene file_type y file_url no nulos y no vacíos.
     */
    private boolean hasFile(RePost rePost) {
        return rePost.getFileType() != null &&
                rePost.getFileUrl() != null &&
                !rePost.getFileUrl().trim().isEmpty();
    }
}