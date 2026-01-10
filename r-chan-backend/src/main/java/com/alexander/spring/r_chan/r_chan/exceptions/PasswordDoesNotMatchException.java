package com.alexander.spring.r_chan.r_chan.exceptions;

public class PasswordDoesNotMatchException extends RuntimeException {
    public PasswordDoesNotMatchException() {
        super("Password does not match");
    }
}
