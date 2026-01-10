package com.alexander.spring.r_chan.r_chan.exceptions;

import java.util.UUID;

public class PostNotFoundException extends RuntimeException {
    public PostNotFoundException(UUID id) {
        super("Post with id: " +  id + ", not found.");
    }
}
