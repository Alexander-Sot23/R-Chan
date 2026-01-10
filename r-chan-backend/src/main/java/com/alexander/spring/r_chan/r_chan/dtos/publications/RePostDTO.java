package com.alexander.spring.r_chan.r_chan.dtos.publications;

import com.alexander.spring.r_chan.r_chan.entity.*;
import com.alexander.spring.r_chan.r_chan.enums.ApprovalStatus;
import com.alexander.spring.r_chan.r_chan.enums.FileStatus;
import com.alexander.spring.r_chan.r_chan.enums.FileType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RePostDTO {
    private UUID id;
    private Post post;
    private String content;
    private String fileUrl;
    private FileType fileType;
    private FileStatus fileStatus;
    private ApprovalStatus approvalStatus;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    public RePostDTO(RePost rePost){
        this.id = rePost.getId();
        this.post = rePost.getPost();
        this.content = rePost.getContent();
        this.fileUrl = rePost.getFileUrl();
        this.fileType = rePost.getFileType();
        this.fileStatus = rePost.getFileStatus();
        this.approvalStatus = rePost.getApprovalStatus();
        this.createdDate = rePost.getCreatedDate();
        this.updatedDate = rePost.getUpdatedDate();
    }
}
