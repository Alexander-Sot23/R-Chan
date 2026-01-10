package com.alexander.spring.r_chan.r_chan.repository;

import com.alexander.spring.r_chan.r_chan.entity.Section;
import com.alexander.spring.r_chan.r_chan.enums.SectionEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SectionRepository extends JpaRepository<Section, UUID> {
    Optional<Section> findBySectionType(SectionEnum sectionEnumType);
}