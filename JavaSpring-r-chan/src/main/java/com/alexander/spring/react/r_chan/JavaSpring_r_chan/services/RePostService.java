package com.alexander.spring.react.r_chan.JavaSpring_r_chan.services;

import com.alexander.spring.react.r_chan.JavaSpring_r_chan.entities.RePost;

import java.util.List;

public interface RePostService {
    List<RePost> findAll();
    RePost findById(Long id);
    List<RePost> findByOriginalPostId(Long postId);
    RePost save(RePost rePost, Long idOriginalPost);
    RePost update(Long id, RePost rePost);
    void delete(Long id);
}
