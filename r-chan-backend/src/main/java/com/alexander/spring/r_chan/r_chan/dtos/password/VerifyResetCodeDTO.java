package com.alexander.spring.r_chan.r_chan.dtos.password;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VerifyResetCodeDTO {

    @NotBlank
    @Email
    @Size(max = 100)
    @Pattern(
            regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
            message = "Invalid email format"
    )
    private String email;

    @NotBlank
    @Size(min = 6, max = 6)
    private String code;
}
