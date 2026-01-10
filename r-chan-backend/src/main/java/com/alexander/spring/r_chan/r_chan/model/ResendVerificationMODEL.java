package com.alexander.spring.r_chan.r_chan.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResendVerificationMODEL(@NotBlank
                                      @Email
                                      @Size(max = 100)
                                      @Pattern(
                                              regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
                                              message = "Invalid email format"
                                      )
                                      String email) {
}
