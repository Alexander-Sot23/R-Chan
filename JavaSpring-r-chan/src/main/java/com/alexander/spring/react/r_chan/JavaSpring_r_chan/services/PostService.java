package com.alexander.spring.react.r_chan.JavaSpring_r_chan.services;

import com.alexander.spring.react.r_chan.JavaSpring_r_chan.entities.Post;

import java.util.List;

public interface PostService {
    List<Post> findAll();
    Post findById(Long id);
    Post save(Post post);
    Post update(Long id, Post post);
    void delete(Long id);
}
