package com.alexander.spring.r_chan.r_chan.services.publications.sections;

import com.alexander.spring.r_chan.r_chan.dtos.publications.SectionDTO;
import com.alexander.spring.r_chan.r_chan.enums.SectionEnum;
import com.alexander.spring.r_chan.r_chan.enums.SectionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface SectionService {
    Page<SectionDTO> findAll(Pageable pageable);
    SectionDTO findById(UUID id);
    com.alexander.spring.r_chan.r_chan.entity.Section findByIdE(UUID id);
    com.alexander.spring.r_chan.r_chan.entity.Section findBySectionType(SectionEnum sectionEnumType);
    SectionDTO updateSectionStatus(UUID id, SectionStatus newStatus);
    void incrementPostCount(UUID sectionId);
    void decrementPostCount(UUID sectionId);
}