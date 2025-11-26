package com.alexander.spring.react.r_chan.JavaSpring_r_chan.repositories;

import com.alexander.spring.react.r_chan.JavaSpring_r_chan.entities.RePost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RePostRepository extends JpaRepository<RePost, Long> {
    List<RePost> findByOriginalPostId(Long originalPostId);
}
