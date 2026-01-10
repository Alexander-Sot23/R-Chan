package com.alexander.spring.r_chan.r_chan.services.storage;

import com.alexander.spring.r_chan.r_chan.enums.FileType;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

public interface FileStorageService {
    String saveFile(MultipartFile fileToSave) throws IOException;
    File getDownloadFile(String fileName) throws FileNotFoundException;
    boolean deleteFile(String fileName) throws IOException;
    FileType extractExtension(String filename);
    String extractOriginalFilename(String filename);
}
