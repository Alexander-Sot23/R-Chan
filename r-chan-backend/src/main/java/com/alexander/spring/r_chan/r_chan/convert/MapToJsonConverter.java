package com.alexander.spring.r_chan.r_chan.convert;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Converter
public class MapToJsonConverter implements AttributeConverter<Map<String, Object>, String> {

    private final ObjectMapper objectMapper;

    public MapToJsonConverter() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.findAndRegisterModules();
        this.objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }

    @Override
    public String convertToDatabaseColumn(Map<String, Object> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "{}";
        }
        try {
            String result = objectMapper.writeValueAsString(attribute);
            return result;
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting map to JSON: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty() || dbData.equals("{}")) {
            return new HashMap<>();
        }
        try {
            Map<String, Object> result = objectMapper.readValue(dbData, new TypeReference<Map<String, Object>>() {});
            return result;
        } catch (IOException e) {
            throw new IllegalArgumentException("Error converting JSON to map: " + e.getMessage(), e);
        }
    }
}