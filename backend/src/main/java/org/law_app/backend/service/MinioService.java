package org.law_app.backend.service;

import java.io.InputStream;
import org.springframework.web.multipart.MultipartFile;

public interface MinioService {
  String uploadImage(MultipartFile file);

  String uploadCV(MultipartFile file);

  String generateFileUrl(String bucket, String objectName);

  DownloadFile download(String bucket, String objectName, String fallbackFileName);

  void delete(String bucket, String objectName);

  record DownloadFile(String fileName, String contentType, InputStream stream) {}
}
