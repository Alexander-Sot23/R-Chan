package com.alexander.spring.react.r_chan.JavaSpring_r_chan.services;

import com.alexander.spring.react.r_chan.JavaSpring_r_chan.entities.Post;
import com.alexander.spring.react.r_chan.JavaSpring_r_chan.entities.RePost;
import com.alexander.spring.react.r_chan.JavaSpring_r_chan.exceptions.PostNotFoundException;
import com.alexander.spring.react.r_chan.JavaSpring_r_chan.exceptions.RePostNotFoundException;
import com.alexander.spring.react.r_chan.JavaSpring_r_chan.repositories.PostRepository;
import com.alexander.spring.react.r_chan.JavaSpring_r_chan.repositories.RePostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RePostServiceImpl implements RePostService{

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private RePostRepository rePostRepository;

    @Override
    public List<RePost> findAll() {
        return rePostRepository.findAll();
    }

    @Override
    public RePost findById(Long id) {
        return rePostRepository.findById(id)
                .orElseThrow(() -> new RePostNotFoundException(id));
    }

    @Override
    public List<RePost> findByOriginalPostId(Long postId) {
        return rePostRepository.findByOriginalPostId(postId);
    }

    @Override
    public RePost save(RePost rePost, Long idOriginalPost) {
        Post postDB = postRepository.findById(idOriginalPost)
                .orElseThrow(() -> new PostNotFoundException(idOriginalPost));
        rePost.setOriginalPost(postDB);
        return rePostRepository.save(rePost);
    }

    @Override
    public RePost update(Long id, RePost rePost) {
        RePost repostDB = rePostRepository.findById(id)
                .orElseThrow(() -> new RePostNotFoundException(id));
        repostDB.setDescription(rePost.getDescription());
        repostDB.setImageURL(rePost.getImageURL());
        rePost.setFilePath(rePost.getFilePath());
        return rePostRepository.save(repostDB);
    }

    @Override
    public void delete(Long id) {
        RePost repostDB = rePostRepository.findById(id)
                .orElseThrow(() -> new RePostNotFoundException(id));
        rePostRepository.delete(repostDB);
    }
}
