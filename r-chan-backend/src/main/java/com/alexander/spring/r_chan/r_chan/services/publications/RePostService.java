package com.alexander.spring.r_chan.r_chan.services.publications;

import com.alexander.spring.r_chan.r_chan.dtos.publications.RePostDTO;
import com.alexander.spring.r_chan.r_chan.entity.RePost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface RePostService {
    Page<RePostDTO> findAll(Pageable pageable);
    Page<RePostDTO> findAllApproved(Pageable pageable);
    RePostDTO findById(UUID id);
    RePostDTO findByPostId(UUID id);
    Page<RePostDTO> findByPostId(UUID postId, Pageable pageable);
    RePost findByIdE(UUID id);
    RePostDTO saveRePost(RePost rePost);
    RePostDTO updateRePost(UUID id, RePost rePost);
    void delete(UUID id);
}
