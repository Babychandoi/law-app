package org.law_app.chat.service;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.chat.config.MinioConfig;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/** Uploads staff-chat attachments to the shared MinIO into a dedicated bucket. */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

  private final MinioClient minioClient;
  private final MinioConfig config;

  public Attachment upload(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empty file");
    }
    try {
      ensureBucket(config.getFilesBucket());
      String original = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
      String safe = original.replaceAll("[^a-zA-Z0-9._-]", "_");
      String objectName = UUID.randomUUID() + "_" + safe;

      minioClient.putObject(
          PutObjectArgs.builder().bucket(config.getFilesBucket()).object(objectName).stream(
                  file.getInputStream(), file.getSize(), -1)
              .contentType(file.getContentType())
              .build());

      String url = config.getPublicUrl() + "/" + config.getFilesBucket() + "/" + objectName;
      return new Attachment(url, original, file.getContentType(), file.getSize());
    } catch (Exception e) {
      log.error("MinIO upload failed: {}", e.getMessage());
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload failed");
    }
  }

  private void ensureBucket(String bucket) throws Exception {
    boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
    if (!exists) {
      minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
    }
  }

  public record Attachment(String url, String name, String mime, long size) {}
}
