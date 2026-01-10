package com.alexander.spring.r_chan.r_chan.services.publications;

import com.alexander.spring.r_chan.r_chan.dtos.publications.PostDTO;
import com.alexander.spring.r_chan.r_chan.entity.Post;
import com.alexander.spring.r_chan.r_chan.enums.SectionEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PostService {
    Page<PostDTO> findAll(Pageable pageable);
    Page<PostDTO> findAllApproved(Pageable pageable);
    PostDTO findById(UUID id);
    Post findByIdE(UUID id);
    Page<PostDTO> findBySectionType(SectionEnum sectionType, Pageable pageable);
    PostDTO savePost(Post post);
    PostDTO savePostWithoutLog(Post post);
    PostDTO updatePost(UUID id, Post post);
    void delete(UUID id);
}
