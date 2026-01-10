package com.alexander.spring.r_chan.r_chan.services.moderation.auto_validation;

public interface ContentValidationService {
    boolean containsRestrictedWords(String content);
}
