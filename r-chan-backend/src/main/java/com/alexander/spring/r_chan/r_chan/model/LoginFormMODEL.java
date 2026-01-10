package com.alexander.spring.r_chan.r_chan.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LoginFormMODEL(@NotBlank
                             String username,

                             @NotBlank
                             @Size(min = 6)
                             @Pattern(
                                     regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$",
                                     message = "Password must contain at least one digit, one lowercase, one uppercase, and one special character"
                             )
                             String password) {
}
