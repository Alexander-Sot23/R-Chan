package com.alexander.spring.r_chan.r_chan.exceptions;

public class AdminUserNotFoundException extends RuntimeException {
    public AdminUserNotFoundException(String type, String id) {
        super("User with " + type + ": " + id + ", not found.");
    }
}
