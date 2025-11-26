package com.alexander.spring.react.r_chan.JavaSpring_r_chan.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    public static final String STORAGE_DIRECTORY = "C:\\Spring Download Tests";

    //Formato para timestaps
    private static final DateTimeFormatter TIMESTAP_FORMATER = DateTimeFormatter.ofPattern("yyyy-MM-dd--HH-mm-ss-SS");

    //Extenciones permitidas
    private static final Set<String> ALLOWED_EXTENCIONS = Set.of("png","jpg","jpeg","mp4","pdf");

    public String saveFile(MultipartFile fileToSave) throws IOException {
        if(fileToSave == null){
            throw new NullPointerException("File to save is null.");
        }

        var contentType = fileToSave.getContentType();
        if(!isAllowedMimeType(contentType)){
            throw new IOException("File type not supported: " + fileToSave);
        }

        String originalFilename = fileToSave.getOriginalFilename();
        if(originalFilename == null || originalFilename.contains("=")){
            throw new RuntimeException("Invalid filename");
        }

        if(!hasAllowedExtencion(originalFilename)){
            throw new IOException("File extencion not allowed: " + originalFilename);
        }

        String timestamp = LocalDateTime.now().format(TIMESTAP_FORMATER);
        String uniqueId = UUID.randomUUID().toString().substring(0,8);
        String safeFilename = timestamp + "_" + uniqueId + "=" + originalFilename;

        var targetFile = new File(STORAGE_DIRECTORY + File.separator +  safeFilename);

        if(!Objects.equals(targetFile.getParent(),STORAGE_DIRECTORY)){
            throw new SecurityException("Unsopported file path");
        }

        Files.copy(fileToSave.getInputStream(), targetFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

        return safeFilename;
    }

    public File getDownloadFile(String fileName) throws FileNotFoundException {

        if(fileName == null){
            throw new NullPointerException("File name is null");
        }

        var fileToDownload = new File(STORAGE_DIRECTORY + File.separator + fileName);

        if(!fileToDownload.exists()){
            throw new FileNotFoundException("No file name: " + fileName);
        }

        if(!Objects.equals(fileToDownload.getParent(), STORAGE_DIRECTORY)){
            throw new SecurityException("Unsupported file name.");
        }

        validateFileType(fileToDownload);

        return fileToDownload;
    }

    private boolean isAllowedMimeType(String mimeType){
        return mimeType != null && (
                mimeType.equals("image/png") ||
                        mimeType.equals("image/jpeg") ||
                        mimeType.equals("video/mp4") ||
                        mimeType.equals("application/pdf")
        );
    }

    private boolean hasAllowedExtencion(String filename){
        String extencion = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        return ALLOWED_EXTENCIONS.contains(extencion);
    }

    private void validateFileType(File file){
        try {
            String fileType = Files.probeContentType(file.toPath());
            if(!isAllowedMimeType(fileType)){
                throw new RuntimeException("File type not supported: " + fileType);
            }
        } catch (IOException e) {
            throw new RuntimeException("Cannot detected file type: " + file.getName(), e);
        }
    }

    public static String extractOriginalFilename(String filename){
        if(filename == null || !filename.contains("=")){
            return filename;
        }
        return filename.substring(filename.indexOf("=") + 1);
    }
}
