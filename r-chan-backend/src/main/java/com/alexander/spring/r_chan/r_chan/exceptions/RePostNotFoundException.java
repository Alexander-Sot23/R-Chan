package com.alexander.spring.r_chan.r_chan.exceptions;

import java.util.UUID;

public class RePostNotFoundException extends RuntimeException {
    public RePostNotFoundException(UUID id) {
        super("RePost with id: " + id + ", not found.");
    }
}
