package com.alexander.spring.r_chan.r_chan.dtos.publications;

import com.alexander.spring.r_chan.r_chan.enums.SectionEnum;
import com.alexander.spring.r_chan.r_chan.enums.SectionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectionDTO {
    private UUID id;
    private SectionEnum sectionEnumType;
    private String displayName;
    private String description;
    private SectionStatus status;
    private Integer postCount;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    public SectionDTO(com.alexander.spring.r_chan.r_chan.entity.Section section) {
        this.id = section.getId();
        this.sectionEnumType = section.getSectionType();
        this.displayName = section.getDisplayName();
        this.description = section.getDescription();
        this.status = section.getStatus();
        this.postCount = section.getPostCount();
        this.createdDate = section.getCreatedDate();
        this.updatedDate = section.getUpdatedDate();
    }

}