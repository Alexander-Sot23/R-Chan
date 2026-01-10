package com.alexander.spring.r_chan.r_chan.dtos.publications;

import com.alexander.spring.r_chan.r_chan.enums.SectionEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePostDTO {

    @NotNull(message = "Section type is required")
    private SectionEnum sectionType;

    @NotBlank
    @Size(max = 255)
    private String title;

    @Size(max = 500)
    private String content;
}