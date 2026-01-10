package com.alexander.spring.r_chan.r_chan.entity;

import com.alexander.spring.r_chan.r_chan.enums.ApprovalStatus;
import com.alexander.spring.r_chan.r_chan.enums.FileStatus;
import com.alexander.spring.r_chan.r_chan.enums.FileType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class RePost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

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

    @Column(name = "created_date")
    @CreationTimestamp
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    @UpdateTimestamp
    private LocalDateTime updatedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @JsonIgnoreProperties("reposts")
    private Post post;

}
