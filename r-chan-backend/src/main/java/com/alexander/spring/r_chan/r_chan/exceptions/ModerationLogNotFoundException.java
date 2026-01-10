package com.alexander.spring.r_chan.r_chan.exceptions;

import java.util.UUID;

public class ModerationLogNotFoundException extends RuntimeException {
    public ModerationLogNotFoundException(UUID id) {
        super("Log with id: " + id +", not found.");
    }
}
