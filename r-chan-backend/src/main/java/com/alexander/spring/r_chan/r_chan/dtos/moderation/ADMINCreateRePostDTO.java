package com.alexander.spring.r_chan.r_chan.dtos.moderation;

import com.alexander.spring.r_chan.r_chan.enums.ApprovalStatus;
import com.alexander.spring.r_chan.r_chan.enums.FileStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ADMINCreateRePostDTO {

    @NotNull
    private UUID postId;

    @Size(max = 500)
    private String content;
    private FileStatus fileStatus;
    private ApprovalStatus approvalStatus;
}
