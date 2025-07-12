package org.law_app.backend.service.impl;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.errors.*;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.security.MinioConfig;
import org.law_app.backend.service.MinioService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class MinioServiceImpl implements MinioService {
    MinioClient minioClient;
    MinioConfig minioConfig;
    @Override
    public String uploadImage(MultipartFile file) {
        try {
            // Lấy tên bucket từ cấu hình
            String bucket = minioConfig.getImagesBucket();
            // Lưu file vào MinIO và trả về URL
            return saveFile(file, bucket);
        } catch (Exception e) {
            log.error("Error uploading file to MinIO: {}", e.getMessage());
            throw new RuntimeException("Failed to upload file", e);
        }
    }
    private String saveFile(MultipartFile file, String bucket) throws IOException {

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();

        try (InputStream inputStream = file.getInputStream()) {
            // Kiểm tra và tạo bucket nếu chưa có
            boolean isExist = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucket).build());
            if (!isExist) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                // ⚠️ Bạn cần cấp quyền public cho bucket sau khi tạo
            }

            // Upload file
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(filename)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
        } catch (ServerException | InsufficientDataException | ErrorResponseException | InvalidKeyException |
                 NoSuchAlgorithmException | InvalidResponseException | XmlParserException | InternalException e) {
            throw new RuntimeException(e);
        }

        // Trả về URL vĩnh viễn (URL public, cần bucket đã public)
        return "http://localhost:9000/" + bucket + "/" + filename;
    }

}
