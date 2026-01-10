package com.alexander.spring.r_chan.r_chan.enums;

public enum SectionEnum {
    //Secciones predefinidas
    GENERAL("General", "Discusiones generales"),
    TECHNOLOGY("Tecnología", "Tecnología e informática"),
    SCIENCE("Ciencia", "Ciencias y descubrimientos"),
    ARTS("Artes", "Arte y cultura"),
    SPORTS("Deportes", "Deportes y actividades físicas"),
    ENTERTAINMENT("Entretenimiento", "Cine, música y televisión"),
    GAMING("Gaming", "Videojuegos y e-sports"),
    NEWS("Noticias", "Noticias actuales");

    private final String displayName;
    private final String description;

    SectionEnum(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}