package com.alexander.spring.r_chan.r_chan.dtos.moderation;

import com.alexander.spring.r_chan.r_chan.enums.SectionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ADMINCreateSectionDTO {

    @NotBlank
    private String name;

    @Size(max = 255)
    private String description;
    private SectionStatus status;
}
