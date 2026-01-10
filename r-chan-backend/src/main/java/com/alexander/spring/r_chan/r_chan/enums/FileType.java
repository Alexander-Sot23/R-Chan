package com.alexander.spring.r_chan.r_chan.enums;

public enum FileType {
    PNG,
    JPG,
    JPEG,
    MP4,
    UNKNOWN;

    public static FileType fromExtension(String extension) {
        if (extension == null){
            return UNKNOWN;
        }

        try {
            return valueOf(extension.toUpperCase());
        } catch (IllegalArgumentException e) {
            return UNKNOWN;
        }
    }
}