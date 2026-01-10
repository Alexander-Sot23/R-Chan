package com.alexander.spring.r_chan.r_chan.exceptions;

import java.util.UUID;

public class SectionNotFoundException extends RuntimeException {
    public SectionNotFoundException(UUID id) {
        super("Section with id: " + id + ", not found.");
    }
}
