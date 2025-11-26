package com.alexander.spring.react.r_chan.JavaSpring_r_chan.exceptions;

public class PostNotFoundException extends RuntimeException {
    public PostNotFoundException(Long id) {
        super("No se encontro el Post con id: " + id);
    }
}
