package com.alexander.spring.r_chan.r_chan.convert;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Convert;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Convert
public class JsonConverter implements AttributeConverter<Map<String, Object>, String> {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Map<String, Object> attribute) {
        return objectMapper.writeValueAsString(attribute);
    }

    @Override
    public Map<String, Object> convertToEntityAttribute(String dbData) {
        return objectMapper.readValue(dbData, new TypeReference<Map<String, Object>>() {});
    }
}