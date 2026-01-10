package com.alexander.spring.r_chan.r_chan.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record DeleteUserFormMODEL(@NotNull
                                  UUID id,

                                  @NotBlank
                                  @Size(min = 6)
                                  @Pattern(
                                          regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$",
                                          message = "Password must contain at least one digit, one lowercase, one uppercase, and one special character"
                                  )
                                  String password) {
}
