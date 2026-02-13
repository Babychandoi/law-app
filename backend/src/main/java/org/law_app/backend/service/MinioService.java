package org.law_app.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface MinioService {
    String uploadImage(MultipartFile file);
    String uploadCV(MultipartFile file);
    String generateFileUrl(String bucket, String objectName);
}
