package com.alexander.spring.r_chan.r_chan.services.moderation.auto_validation;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class ContentValidationServiceImpl implements ContentValidationService{

    private final List<String> restrictedWords;

    //Lista de palabras restringidas cargada desde mi properties
    public ContentValidationServiceImpl(@Value("${app.restricted.words}") String words) {
        this.restrictedWords = Arrays.asList(words.split(","));
    }

    /**
     * Valida si el contenido contiene palabras restringidas.
     * @param content El contenido a validar.
     * @return true si contiene palabras restringidas, false en caso contrario.
     */
    @Override
    public boolean containsRestrictedWords(String content) {
        if (content == null || content.isEmpty()) {
            return false;
        }

        String lowerContent = content.toLowerCase();
        for (String word : restrictedWords) {
            if (lowerContent.contains(word.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

}
