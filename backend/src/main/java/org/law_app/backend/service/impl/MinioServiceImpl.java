package org.law_app.backend.service.impl;

import io.minio.*;
import io.minio.errors.*;
import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.security.MinioConfig;
import org.law_app.backend.service.MinioService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class MinioServiceImpl implements MinioService {

  MinioClient minioClient;
  MinioConfig minioConfig;

  // Giới hạn nén ảnh: bề ngang tối đa và chất lượng WebP
  private static final int MAX_IMAGE_WIDTH = 1200;
  private static final double WEBP_QUALITY = 0.8;

  @Override
  public String uploadImage(MultipartFile file) {
    try {
      String bucket = minioConfig.getImagesBucket();
      // GIF (có thể là ảnh động) giữ nguyên; còn lại tự nén
      if (!"image/gif".equalsIgnoreCase(file.getContentType())) {
        CompressedImage compressed = compressImage(file);
        if (compressed != null && compressed.data.length < file.getSize()) {
          String filename =
              UUID.randomUUID()
                  + "_"
                  + stripExtension(file.getOriginalFilename())
                  + "."
                  + compressed.format;
          saveBytes(compressed.data, filename, "image/" + compressed.format, bucket);
          log.info(
              "Compressed image {} : {} -> {} bytes ({})",
              file.getOriginalFilename(),
              file.getSize(),
              compressed.data.length,
              compressed.format);
          return filename;
        }
      }
      return saveFile(file, bucket);
    } catch (Exception e) {
      log.error("Error uploading file to MinIO: {}", e.getMessage());
      throw new RuntimeException("Failed to upload file", e);
    }
  }

  private record CompressedImage(byte[] data, String format) {}

  /**
   * Nén ảnh: resize tối đa MAX_IMAGE_WIDTH px. Ưu tiên WebP; nếu encoder WebP không chạy được
   * (native lib thiếu trên Alpine) thì fallback JPEG cho ảnh không trong suốt. Trả null nếu không
   * xử lý được — caller sẽ upload file gốc.
   */
  private CompressedImage compressImage(MultipartFile file) {
    java.awt.image.BufferedImage image;
    try {
      image = javax.imageio.ImageIO.read(file.getInputStream());
    } catch (Exception e) {
      log.warn("Cannot read image {}: {}", file.getOriginalFilename(), e.getMessage());
      return null;
    }
    if (image == null) return null;
    int targetWidth = Math.min(image.getWidth(), MAX_IMAGE_WIDTH);

    // Ưu tiên WebP (catch Throwable vì UnsatisfiedLinkError là Error)
    try {
      java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
      net.coobird.thumbnailator.Thumbnails.of(image)
          .width(targetWidth)
          .outputFormat("webp")
          .outputQuality(WEBP_QUALITY)
          .toOutputStream(out);
      if (out.size() > 0) return new CompressedImage(out.toByteArray(), "webp");
    } catch (Throwable t) {
      log.warn("WebP encode unavailable ({}), trying JPEG", t.getMessage());
    }

    // Fallback JPEG (thuần Java) — chỉ với ảnh không có kênh trong suốt
    if (!image.getColorModel().hasAlpha()) {
      try {
        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
        net.coobird.thumbnailator.Thumbnails.of(image)
            .width(targetWidth)
            .outputFormat("jpg")
            .outputQuality(WEBP_QUALITY)
            .toOutputStream(out);
        if (out.size() > 0) return new CompressedImage(out.toByteArray(), "jpeg");
      } catch (Exception e) {
        log.warn("JPEG encode failed: {}", e.getMessage());
      }
    }
    return null;
  }

  private String stripExtension(String name) {
    if (name == null) return "image";
    int dot = name.lastIndexOf('.');
    return dot > 0 ? name.substring(0, dot) : name;
  }

  private void saveBytes(byte[] data, String filename, String contentType, String bucket)
      throws IOException,
          ServerException,
          InsufficientDataException,
          InvalidKeyException,
          NoSuchAlgorithmException,
          XmlParserException,
          ErrorResponseException,
          InvalidResponseException,
          InternalException {
    boolean isExists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
    if (!isExists) {
      minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
    }
    minioClient.putObject(
        PutObjectArgs.builder().bucket(bucket).object(filename).stream(
                new java.io.ByteArrayInputStream(data), data.length, -1)
            .contentType(contentType)
            .build());
  }

  @Override
  public String uploadCV(MultipartFile file) {
    try {
      String bucket = minioConfig.getCvsBucket();
      return saveFile(file, bucket);
    } catch (Exception e) {
      log.error("Error uploading CV to MinIO: {}", e.getMessage());
      throw new RuntimeException("Failed to upload CV", e);
    }
  }

  private String saveFile(MultipartFile file, String bucket)
      throws IOException,
          ServerException,
          InsufficientDataException,
          InvalidKeyException,
          NoSuchAlgorithmException,
          XmlParserException,
          ErrorResponseException,
          InvalidResponseException,
          InternalException {
    String filename = UUID.randomUUID() + safeExtension(file.getOriginalFilename());
    InputStream inputStream = file.getInputStream();
    boolean isExists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
    if (!isExists) {
      minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
    }
    minioClient.putObject(
        PutObjectArgs.builder().bucket(bucket).object(filename).stream(
                inputStream, file.getSize(), -1)
            .contentType(file.getContentType())
            .build());
    return filename;
  }

  private String safeExtension(String originalName) {
    if (originalName == null) return "";
    int dot = originalName.lastIndexOf('.');
    if (dot < 0 || dot == originalName.length() - 1) return "";
    String extension = originalName.substring(dot).toLowerCase(java.util.Locale.ROOT);
    return extension.matches("\\.[a-z0-9]{1,10}") ? extension : "";
  }

  public String generateFileUrl(String bucket, String objectName) {
    try {
      return minioConfig.getPublicUrl() + "/" + bucket + "/" + objectName;
    } catch (Exception e) {
      log.error("Error generating file URL: {}", e.getMessage());
      throw new RuntimeException("Failed to generate file URL", e);
    }
  }

  @Override
  public DownloadFile download(String bucket, String objectName, String fallbackFileName) {
    try {
      StatObjectResponse stat =
          minioClient.statObject(
              StatObjectArgs.builder().bucket(bucket).object(objectName).build());
      InputStream stream =
          minioClient.getObject(GetObjectArgs.builder().bucket(bucket).object(objectName).build());
      String contentType =
          stat.contentType() == null || stat.contentType().isBlank()
              ? "application/octet-stream"
              : stat.contentType();
      String fileName =
          fallbackFileName == null || fallbackFileName.isBlank() ? objectName : fallbackFileName;
      return new DownloadFile(fileName, contentType, stream);
    } catch (Exception e) {
      log.warn("Cannot read private object {}/{}: {}", bucket, objectName, e.getMessage());
      throw new RuntimeException("File is unavailable", e);
    }
  }

  @Override
  public void delete(String bucket, String objectName) {
    if (objectName == null || objectName.isBlank()) return;
    try {
      minioClient.removeObject(
          RemoveObjectArgs.builder().bucket(bucket).object(objectName).build());
    } catch (Exception e) {
      log.warn("Cannot delete private object from bucket {}: {}", bucket, e.getMessage());
      throw new RuntimeException("File cleanup failed", e);
    }
  }
}
