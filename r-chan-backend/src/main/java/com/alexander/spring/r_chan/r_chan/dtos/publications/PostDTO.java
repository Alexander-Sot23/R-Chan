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
public class PostDTO {
    private UUID id;
    private Section section;
    private String title;
    private String content;
    private String fileUrl;
    private FileType fileType;
    private FileStatus fileStatus;
    private ApprovalStatus approvalStatus;
    private Integer replyCount;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    public PostDTO(Post post){
        this.id = post.getId();
        this.section = post.getSection();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.fileUrl = post.getFileUrl();
        this.fileType = post.getFileType();
        this.fileStatus = post.getFileStatus();
        this.approvalStatus = post.getApprovalStatus();
        this.replyCount = post.getReplyCount();
        this.createdDate = post.getCreatedDate();
        this.updatedDate = post.getUpdatedDate();

        if (post.getReposts() != null) {
            this.replyCount = (int) post.getReposts().stream()
                    .filter(repost -> repost.getApprovalStatus() == ApprovalStatus.APPROVED ||
                            repost.getApprovalStatus() == ApprovalStatus.AUTO_APPROVED)
                    .count();
        } else {
            this.replyCount = 0;
        }
    }
}
