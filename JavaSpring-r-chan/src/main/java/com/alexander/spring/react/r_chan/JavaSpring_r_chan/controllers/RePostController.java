package com.alexander.spring.react.r_chan.JavaSpring_r_chan.controllers;

import com.alexander.spring.react.r_chan.JavaSpring_r_chan.entities.RePost;
import com.alexander.spring.react.r_chan.JavaSpring_r_chan.services.FileStorageService;
import com.alexander.spring.react.r_chan.JavaSpring_r_chan.services.RePostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class RePostController {

    @Autowired
    private RePostService rePostService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/reposts")
    public ResponseEntity<?> findAll(){
        return ResponseEntity.ok(rePostService.findAll());
    }

    @GetMapping("/reposts/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id){
        return ResponseEntity.ok(rePostService.findById(id));
    }

    @GetMapping("/reposts/post/{postId}")
    public ResponseEntity<?> findByOriginalPostId(@PathVariable Long postId) {
        List<RePost> reposts = rePostService.findByOriginalPostId(postId);
        return ResponseEntity.ok(reposts);
    }

    @PostMapping("/reposts/{idOriginalPost}")
    public ResponseEntity<?> save(
            @PathVariable Long idOriginalPost,
            @RequestParam("description") String description,
            @RequestParam(value = "file", required = false) MultipartFile file){

        RePost rePost = new RePost();
        rePost.setDescription(description);

        try {
            if(file != null){
                String fileName = fileStorageService.saveFile(file);
                rePost.setFilePath(fileName);
            }
        } catch (IOException e) {
            throw new RuntimeException("Exception during upload",e);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(rePostService.save(rePost, idOriginalPost));
    }

    @PutMapping("/reposts/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody RePost rePost){
        return ResponseEntity.ok(rePostService.update(id, rePost));
    }

    @DeleteMapping("/reposts/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        rePostService.delete(id);
        return ResponseEntity.ok().build();
    }
}
