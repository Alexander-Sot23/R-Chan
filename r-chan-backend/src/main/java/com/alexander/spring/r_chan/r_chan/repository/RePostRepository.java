package com.alexander.spring.r_chan.r_chan.repository;

import com.alexander.spring.r_chan.r_chan.entity.RePost;
import com.alexander.spring.r_chan.r_chan.enums.ApprovalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RePostRepository extends JpaRepository<RePost, UUID> {
    Optional<RePost> findByPostId(UUID id);
    List<RePost> findByPost_Id(UUID postId);

    @Query("SELECT r FROM RePost r WHERE r.post.id = :postId")
    Page<RePost> findByPostId(@Param("postId") UUID postId, Pageable pageable);

    //Para findAllApproved
    @Query("SELECT r FROM RePost r WHERE r.approvalStatus IN :statuses")
    Page<RePost> findAllApproved(@Param("statuses") List<ApprovalStatus> statuses, Pageable pageable);

    //Para findByPostId (modificar el existente)
    @Query("SELECT r FROM RePost r WHERE r.post.id = :postId AND r.approvalStatus IN :statuses")
    List<RePost> findByPost_IdAndApprovalStatusIn(@Param("postId") UUID postId, @Param("statuses") List<ApprovalStatus> statuses);
}
