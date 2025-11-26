package com.alexander.spring.react.r_chan.JavaSpring_r_chan.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reposts")
@AllArgsConstructor
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class RePost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_post_id")
    @JsonIgnoreProperties("rePosts")
    private Post originalPost;

    private String description;

    @Column(name = "image_url")
    private String imageURL;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "creation_date")
    private LocalDateTime creationDate;

    public RePost(){
        creationDate = LocalDateTime.now();
    }
}
