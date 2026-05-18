package org.law_app.backend.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.dto.response.ApiResponse;
import org.law_app.backend.service.MinioService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true , level = AccessLevel.PRIVATE)
public class MinioController {
    MinioService minioService;
    @PostMapping
    ApiResponse<String> uploadFile(@RequestParam("file") MultipartFile file ) {
        return ApiResponse.<String>builder()
                .message("File uploaded successfully")
                .data(minioService.uploadImage(file))
                .build();
    }
}
