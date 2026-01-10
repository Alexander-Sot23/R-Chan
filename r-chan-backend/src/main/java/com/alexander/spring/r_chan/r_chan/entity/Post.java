package com.alexander.spring.r_chan.r_chan.entity;

import com.alexander.spring.r_chan.r_chan.enums.ApprovalStatus;
import com.alexander.spring.r_chan.r_chan.enums.FileStatus;
import com.alexander.spring.r_chan.r_chan.enums.FileType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    @JsonIgnoreProperties("posts")
    private Section section;

    @NotBlank
    @Size(max = 255)
    private String title;
    private String content;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "file_type")
    @Enumerated(EnumType.STRING)
    private FileType fileType;

    @Column(name = "file_status")
    @Enumerated(EnumType.STRING)
    private FileStatus fileStatus;

    @Column(name = "approval_status")
    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "reply_count")
    private Integer replyCount = 0;

    @Column(name = "created_date")
    @CreationTimestamp
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    @UpdateTimestamp
    private LocalDateTime updatedDate;

    @JsonIgnore
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<RePost> reposts = new ArrayList<>();

}
