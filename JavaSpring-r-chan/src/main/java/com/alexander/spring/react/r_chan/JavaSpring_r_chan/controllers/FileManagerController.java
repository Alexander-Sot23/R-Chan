package com.alexander.spring.react.r_chan.JavaSpring_r_chan.controllers;

import com.alexander.spring.react.r_chan.JavaSpring_r_chan.services.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.FileNotFoundException;

@RestController
@RequestMapping("/api")
public class FileManagerController {

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/view-file")
    public ResponseEntity<Resource> viewFile(@RequestParam("fileName") String fileName){
        try {
            var fileToDownload = fileStorageService.getDownloadFile(fileName);
            String originalFileName = FileStorageService.extractOriginalFilename(fileName);

            MediaType mediaType = determineMediaType(fileName);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + originalFileName + "\"")
                    .contentLength(fileToDownload.length())
                    .contentType(mediaType)
                    .body(new FileSystemResource(fileToDownload)
                    );

        } catch (FileNotFoundException e) {
            System.out.println("---Archivo no encontrado");
            return ResponseEntity.notFound().build();
        }
    }

    private MediaType determineMediaType(String fileName){
        if (fileName.toLowerCase().endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        } else if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        } else if (fileName.toLowerCase().endsWith(".mp4")) {
            return MediaType.valueOf("video/mp4");
        } else if (fileName.toLowerCase().endsWith(".pdf")) {
            return MediaType.APPLICATION_PDF;
        } else {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
