package com.alexander.spring.r_chan.r_chan.repository;

import com.alexander.spring.r_chan.r_chan.entity.ModerationLog;
import com.alexander.spring.r_chan.r_chan.enums.Actions;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

public interface ModerationLogRepository extends JpaRepository<ModerationLog, UUID> {

    Page<ModerationLog> findByAdminUserId(UUID adminId, Pageable pageable);
    Page<ModerationLog> findByPostId(UUID postId, Pageable pageable);
    Long countByAdminUserId(UUID adminId);
    Page<ModerationLog> findByAction(Actions action, Pageable pageable);

    @Query("SELECT ml FROM ModerationLog ml WHERE ml.createdAt BETWEEN :startDate AND :endDate")
    Page<ModerationLog> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate,
                                        Pageable pageable);

    @Query("SELECT ml FROM ModerationLog ml WHERE ml.adminUser.id = :adminId AND ml.createdAt BETWEEN :startDate AND :endDate")
    Page<ModerationLog> findByAdminAndDateRange(@Param("adminId") UUID adminId,
                                                @Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate,
                                                Pageable pageable);

    @Query("SELECT COUNT(ml) FROM ModerationLog ml WHERE ml.adminUser.id = :adminId")
    Long countByAdminId(@Param("adminId") UUID adminId);

    @Query("SELECT COUNT(DISTINCT ml.adminUser.id) FROM ModerationLog ml WHERE ml.adminUser IS NOT NULL")
    long countDistinctAdmins();

    @Query("SELECT COUNT(ml) FROM ModerationLog ml WHERE ml.postId IS NOT NULL")
    long countPostsAffected();

    @Query("SELECT COUNT(ml) FROM ModerationLog ml WHERE ml.repostId IS NOT NULL")
    long countRepostsAffected();

    @Query("SELECT COUNT(ml) FROM ModerationLog ml WHERE ml.adminUser.id = :adminId AND ml.postId IS NOT NULL")
    Long countPostsByAdminId(@Param("adminId") UUID adminId);

    @Query("SELECT COUNT(ml) FROM ModerationLog ml WHERE ml.adminUser.id = :adminId AND ml.repostId IS NOT NULL")
    Long countRepostsByAdminId(@Param("adminId") UUID adminId);
}