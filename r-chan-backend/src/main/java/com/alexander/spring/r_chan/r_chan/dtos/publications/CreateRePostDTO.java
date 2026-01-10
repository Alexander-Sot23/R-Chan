package com.alexander.spring.r_chan.r_chan.dtos.publications;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRePostDTO {

    @NotNull
    private UUID postId;

    @Size(max = 500)
    private String content;
}
