package com.alexander.spring.react.r_chan.JavaSpring_r_chan.repositories;

import com.alexander.spring.react.r_chan.JavaSpring_r_chan.entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
}
