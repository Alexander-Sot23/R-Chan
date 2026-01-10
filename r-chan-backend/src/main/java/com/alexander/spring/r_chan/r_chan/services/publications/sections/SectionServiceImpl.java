package com.alexander.spring.r_chan.r_chan.services.publications.sections;

import com.alexander.spring.r_chan.r_chan.dtos.publications.SectionDTO;
import com.alexander.spring.r_chan.r_chan.enums.SectionEnum;
import com.alexander.spring.r_chan.r_chan.enums.SectionStatus;
import com.alexander.spring.r_chan.r_chan.exceptions.SectionNotFoundException;
import com.alexander.spring.r_chan.r_chan.repository.SectionRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class SectionServiceImpl implements SectionService {

    @Autowired
    private SectionRepository sectionRepository;

    @PostConstruct
    @Transactional
    public void initializeSections() {
        for (SectionEnum sectionEnumEnum : SectionEnum.values()) {
            //Verifica si la sección ya existe
            sectionRepository.findBySectionType(sectionEnumEnum).orElseGet(() -> {
                com.alexander.spring.r_chan.r_chan.entity.Section section = new com.alexander.spring.r_chan.r_chan.entity.Section();
                section.setSectionType(sectionEnumEnum);
                section.setStatus(SectionStatus.ACTIVED);
                section.setPostCount(0);
                return sectionRepository.save(section);
            });
        }
    }

    @Override
    public Page<SectionDTO> findAll(Pageable pageable) {
        return sectionRepository.findAll(pageable).map(SectionDTO::new);
    }

    @Override
    public SectionDTO findById(UUID id) {
        com.alexander.spring.r_chan.r_chan.entity.Section sectionDB = sectionRepository.findById(id)
                .orElseThrow(() -> new SectionNotFoundException(id));
        return new SectionDTO(sectionDB);
    }

    @Override
    public com.alexander.spring.r_chan.r_chan.entity.Section findByIdE(UUID id) {
        return sectionRepository.findById(id)
                .orElseThrow(() -> new SectionNotFoundException(id));
    }

    @Override
    public com.alexander.spring.r_chan.r_chan.entity.Section findBySectionType(SectionEnum sectionEnumType) {
        return sectionRepository.findBySectionType(sectionEnumType)
                .orElseThrow(() -> new RuntimeException("Section not found for type: " + sectionEnumType));
    }

    //Método para cambiar el estado de una sección (activar/desactivar)
    @Transactional
    public SectionDTO updateSectionStatus(UUID id, SectionStatus newStatus) {
        com.alexander.spring.r_chan.r_chan.entity.Section sectionDB = sectionRepository.findById(id)
                .orElseThrow(() -> new SectionNotFoundException(id));

        sectionDB.setStatus(newStatus);
        sectionRepository.save(sectionDB);

        return new SectionDTO(sectionDB);
    }

    //Métodos para manejar el contador de posts
    @Transactional
    public void incrementPostCount(UUID sectionId) {
        com.alexander.spring.r_chan.r_chan.entity.Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new SectionNotFoundException(sectionId));
        section.setPostCount(section.getPostCount() + 1);
        sectionRepository.save(section);
    }

    @Transactional
    public void decrementPostCount(UUID sectionId) {
        com.alexander.spring.r_chan.r_chan.entity.Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new SectionNotFoundException(sectionId));
        if (section.getPostCount() > 0) {
            section.setPostCount(section.getPostCount() - 1);
            sectionRepository.save(section);
        }
    }

}