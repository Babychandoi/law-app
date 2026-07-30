package org.law_app.document.service;

import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.ListObjectsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.Result;
import io.minio.messages.Item;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioDocumentStorageService {

  private final MinioClient minioClient;

  public void uploadMultipart(String bucket, String objectName, MultipartFile file) {
    try {
      ensureBucket(bucket);
      minioClient.putObject(
          PutObjectArgs.builder().bucket(bucket).object(objectName).stream(
                  file.getInputStream(), file.getSize(), -1)
              .contentType(file.getContentType())
              .build());
    } catch (Exception e) {
      log.error("Document upload to MinIO failed: {}", e.getMessage(), e);
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload failed");
    }
  }

  public void uploadBytes(String bucket, String objectName, byte[] data, String contentType) {
    try {
      ensureBucket(bucket);
      minioClient.putObject(
          PutObjectArgs.builder().bucket(bucket).object(objectName).stream(
                  new ByteArrayInputStream(data), data.length, -1)
              .contentType(contentType)
              .build());
    } catch (Exception e) {
      log.error("Generated document upload to MinIO failed: {}", e.getMessage(), e);
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload failed");
    }
  }

  public InputStream getObject(String bucket, String objectName) {
    try {
      GetObjectResponse response =
          minioClient.getObject(GetObjectArgs.builder().bucket(bucket).object(objectName).build());
      return response;
    } catch (Exception e) {
      log.error("Document download from MinIO failed: {}", e.getMessage(), e);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
    }
  }

  /** Compensation hook for objects created by a metadata operation that subsequently failed. */
  public void deleteObject(String bucket, String objectName) {
    try {
      minioClient.removeObject(
          RemoveObjectArgs.builder().bucket(bucket).object(objectName).build());
    } catch (Exception e) {
      // Do not mask the original metadata failure; operators can reconcile by immutable prefix.
      log.warn(
          "Could not compensate document object upload bucket={} object={}: {}",
          bucket,
          objectName,
          e.getClass().getSimpleName());
    }
  }

  /** Một object trong bucket cùng thời điểm sửa gần nhất, phục vụ đối soát file rác. */
  public record StoredObject(String objectName, Instant lastModified) {}

  /** Liệt kê đệ quy các object trong bucket (dùng cho job đối soát/dọn file rác). */
  public List<StoredObject> listObjects(String bucket) {
    List<StoredObject> objects = new ArrayList<>();
    try {
      ensureBucket(bucket);
      Iterable<Result<Item>> results =
          minioClient.listObjects(ListObjectsArgs.builder().bucket(bucket).recursive(true).build());
      for (Result<Item> result : results) {
        Item item = result.get();
        if (item.isDir()) continue;
        Instant modified = item.lastModified() == null ? null : item.lastModified().toInstant();
        objects.add(new StoredObject(item.objectName(), modified));
      }
    } catch (Exception e) {
      log.error("Listing MinIO bucket {} failed: {}", bucket, e.getClass().getSimpleName());
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "List failed");
    }
    return objects;
  }

  private void ensureBucket(String bucket) throws Exception {
    boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
    if (!exists) {
      minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
    }
  }
}
