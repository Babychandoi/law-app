package org.law_app.chat.service;

import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
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
  private final MinioClient presignMinioClient;
  private final MinioConfig config;

  private static final int PRESIGN_EXPIRY_HOURS = 6;

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

  /**
   * The bucket is private; messages store a stable canonical URL
   * (public-url/bucket/objectName) and we exchange it for a short-lived presigned
   * URL every time a message is served. Unknown/foreign URLs pass through as-is.
   */
  public String presignUrl(String storedUrl) {
    if (storedUrl == null) {
      return null;
    }
    String prefix = config.getPublicUrl() + "/" + config.getFilesBucket() + "/";
    if (!storedUrl.startsWith(prefix)) {
      return storedUrl;
    }
    try {
      String objectName = storedUrl.substring(prefix.length());
      return presignMinioClient.getPresignedObjectUrl(
          GetPresignedObjectUrlArgs.builder()
              .method(Method.GET)
              .bucket(config.getFilesBucket())
              .object(objectName)
              .expiry(PRESIGN_EXPIRY_HOURS, TimeUnit.HOURS)
              .build());
    } catch (Exception e) {
      log.error("MinIO presign failed for {}: {}", storedUrl, e.getMessage());
      return storedUrl;
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
