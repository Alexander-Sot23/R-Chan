package com.alexander.spring.react.r_chan.JavaSpring_r_chan.services;

import com.alexander.spring.react.r_chan.JavaSpring_r_chan.exceptions.PostNotFoundException;
import com.alexander.spring.react.r_chan.JavaSpring_r_chan.entities.Post;
import com.alexander.spring.react.r_chan.JavaSpring_r_chan.repositories.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostServiceImpl implements PostService{

    @Autowired
    private PostRepository postRepository;

    @Override
    public List<Post> findAll() {
        return postRepository.findAll();
    }

    @Override
    public Post findById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
    }

    @Override
    public Post save(Post post) {
        return postRepository.save(post);
    }

    @Override
    public Post update(Long id, Post post) {
        Post postDB = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
        postDB.setTitle(post.getTitle());
        postDB.setDescription(post.getDescription());
        postDB.setImageURL(post.getImageURL());
        postDB.setFilePath(post.getFilePath());
        postDB.setGender(post.getGender());
        return postRepository.save(postDB);
    }

    @Override
    public void delete(Long id) {
        Post postDB = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
        postRepository.delete(postDB);
    }
}
