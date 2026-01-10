package com.alexander.spring.r_chan.r_chan.repository;

import com.alexander.spring.r_chan.r_chan.entity.Post;
import com.alexander.spring.r_chan.r_chan.enums.ApprovalStatus;
import com.alexander.spring.r_chan.r_chan.enums.SectionEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {
    Page<Post> findBySection_SectionType(SectionEnum sectionEnumType, Pageable pageable);
    //Para findAllApproved
    @Query("SELECT p FROM Post p WHERE p.approvalStatus IN :statuses")
    Page<Post> findAllApproved(@Param("statuses") List<ApprovalStatus> statuses, Pageable pageable);

    //Para findBySectionType (modificar el existente)
    @Query("SELECT p FROM Post p WHERE p.section.sectionType = :sectionType AND p.approvalStatus IN :statuses")
    Page<Post> findBySection_SectionTypeAndApprovalStatusIn(@Param("sectionType") SectionEnum sectionEnumType, @Param("statuses") List<ApprovalStatus> statuses, Pageable pageable);
}
