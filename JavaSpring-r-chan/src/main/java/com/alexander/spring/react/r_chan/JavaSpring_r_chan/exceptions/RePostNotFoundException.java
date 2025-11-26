package com.alexander.spring.react.r_chan.JavaSpring_r_chan.exceptions;

public class RePostNotFoundException extends RuntimeException {
    public RePostNotFoundException(Long id) {
        super("No se encontro el RePost con id: " + id);
    }
}
