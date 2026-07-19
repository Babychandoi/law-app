package org.law_app.chat.config;

import io.minio.MinioClient;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class MinioConfig {

  @Value("${minio.url}")
  private String url;

  @Value("${minio.public-url}")
  private String publicUrl;

  @Value("${minio.access-key}")
  private String accessKey;

  @Value("${minio.secret-key}")
  private String secretKey;

  @Value("${minio.bucket.files}")
  private String filesBucket;

  @Bean
  public MinioClient minioClient() {
    return MinioClient.builder().endpoint(url).credentials(accessKey, secretKey).build();
  }

  // Presigned URLs embed the request host in the signature, so they must be
  // generated against the public endpoint the browser will actually call.
  @Bean
  public MinioClient presignMinioClient() {
    return MinioClient.builder().endpoint(publicUrl).credentials(accessKey, secretKey).build();
  }
}
