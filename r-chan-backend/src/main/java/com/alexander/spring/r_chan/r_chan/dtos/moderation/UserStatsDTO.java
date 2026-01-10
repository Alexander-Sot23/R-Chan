package com.alexander.spring.r_chan.r_chan.dtos.moderation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {
    private long totalUsers;
    private long activeUsers;
    private long pendingVerificationUsers;
}