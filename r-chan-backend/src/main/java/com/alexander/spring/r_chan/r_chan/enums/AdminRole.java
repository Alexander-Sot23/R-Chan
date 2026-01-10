package com.alexander.spring.r_chan.r_chan.enums;

public enum AdminRole {
    ADMIN("Administrator"),
    MODERATOR("Moderator");

    private final String displayName;

    AdminRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    //Solo ADMIN puede crear usuarios
    public boolean canCreateUsers() {
        return this == ADMIN;
    }
}