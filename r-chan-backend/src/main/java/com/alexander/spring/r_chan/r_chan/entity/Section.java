package com.alexander.spring.r_chan.r_chan.entity;

import com.alexander.spring.r_chan.r_chan.enums.SectionEnum;
import com.alexander.spring.r_chan.r_chan.enums.SectionStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private SectionEnum sectionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SectionStatus status = SectionStatus.ACTIVED;

    @Column(nullable = false)
    private Integer postCount = 0;

    @CreationTimestamp
    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @UpdateTimestamp
    @Column(name = "updated_date", nullable = false)
    private LocalDateTime updatedDate;

    public String getDisplayName() {
        return sectionType.getDisplayName();
    }

    public String getDescription() {
        return sectionType.getDescription();
    }
}