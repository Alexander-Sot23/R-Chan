package com.alexander.spring.react.r_chan.JavaSpring_r_chan.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
@AllArgsConstructor
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Post {

    @Id()
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;
    private String description;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "image_url")
    private String imageURL;

    private String gender;

    @Column(name = "creation_date")
    private LocalDateTime creationDate;

    @OneToMany(mappedBy = "originalPost",cascade = CascadeType.ALL)
    @JsonIgnore
    private List<RePost> rePosts = new ArrayList<>();

    public Post(){
        creationDate = LocalDateTime.now();
    }
}
