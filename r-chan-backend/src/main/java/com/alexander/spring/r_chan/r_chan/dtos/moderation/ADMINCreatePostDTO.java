package com.alexander.spring.r_chan.r_chan.dtos.moderation;

import com.alexander.spring.r_chan.r_chan.enums.ApprovalStatus;
import com.alexander.spring.r_chan.r_chan.enums.FileStatus;
import com.alexander.spring.r_chan.r_chan.enums.SectionEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ADMINCreatePostDTO {

    @NotNull(message = "Section type is required")
    private SectionEnum sectionType;

    @NotBlank
    @Size(max = 255)
    private String title;

    @Size(max = 500)
    private String content;
    private FileStatus fileStatus;
    private ApprovalStatus approvalStatus;

}
