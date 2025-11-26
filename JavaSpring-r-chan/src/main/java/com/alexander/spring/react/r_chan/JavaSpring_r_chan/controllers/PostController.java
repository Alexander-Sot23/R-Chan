package com.alexander.spring.react.r_chan.JavaSpring_r_chan.controllers;

import com.alexander.spring.react.r_chan.JavaSpring_r_chan.entities.Post;
import com.alexander.spring.react.r_chan.JavaSpring_r_chan.services.FileStorageService;
import com.alexander.spring.react.r_chan.JavaSpring_r_chan.services.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/posts")
    public ResponseEntity<?> findAll(){
        return ResponseEntity.ok(postService.findAll());
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id){
        return ResponseEntity.ok(postService.findById(id));
    }

    @PostMapping("/posts")
    public ResponseEntity<?> save(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "file", required = false)MultipartFile file){

        Post post = new Post();
        post.setTitle(title);
        post.setDescription(description);
        post.setGender(gender);

        try {
            if(file != null){
                String fileName = fileStorageService.saveFile(file);
                post.setFilePath(fileName);
            }
        } catch (IOException e) {
            throw new RuntimeException("Exception during upload",e);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.save(post));
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,@RequestBody Post post){
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.update(id,post));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        postService.delete(id);
        return ResponseEntity.ok().build();
    }
}
