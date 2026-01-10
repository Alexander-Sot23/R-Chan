package com.alexander.spring.r_chan.r_chan.dtos.password;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordDTO {

    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank
    @Size(min = 6)
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$",
            message = "Password must contain at least one digit, one lowercase, one uppercase, and one special character"
    )
    private String newPassword;

    @NotBlank
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$",
            message = "Password must contain at least one digit, one lowercase, one uppercase, and one special character"
    )
    private String confirmNewPassword;
}