package org.law_app.document.service;

import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.law_app.document.config.MinioConfig;
import org.law_app.document.repository.DocumentTemplateRepository;
import org.law_app.document.repository.DocumentTemplateVersionRepository;
import org.law_app.document.repository.GeneratedDocumentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Đối soát object storage với metadata để dọn "file rác": các object DOCX không còn bản ghi nào
 * tham chiếu (do một bước ghi metadata thất bại sau khi upload). Chỉ xóa object cũ hơn khoảng ân
 * hạn để không đụng vào upload đang diễn ra. Không ghi PII; chỉ log số đếm.
 */
@Slf4j
@Service
public class DocumentStorageReconciliationService {

  private final DocumentTemplateRepository templateRepository;
  private final DocumentTemplateVersionRepository versionRepository;
  private final GeneratedDocumentRepository generatedRepository;
  private final MinioDocumentStorageService storage;
  private final MinioConfig minioConfig;

  @Value("${document.reconciliation.enabled:true}")
  private boolean enabled;

  @Value("${document.reconciliation.grace-hours:24}")
  private long graceHours;

  public DocumentStorageReconciliationService(
      DocumentTemplateRepository templateRepository,
      DocumentTemplateVersionRepository versionRepository,
      GeneratedDocumentRepository generatedRepository,
      MinioDocumentStorageService storage,
      MinioConfig minioConfig) {
    this.templateRepository = templateRepository;
    this.versionRepository = versionRepository;
    this.generatedRepository = generatedRepository;
    this.storage = storage;
    this.minioConfig = minioConfig;
  }

  /** Kết quả một lần đối soát (phục vụ test và log). */
  public record ReconciliationSummary(int scanned, int deleted, int retained) {}

  @Scheduled(cron = "${document.reconciliation.cron:0 0 3 * * *}")
  public void scheduledReconcile() {
    if (!enabled) {
      log.debug("Storage reconciliation disabled");
      return;
    }
    try {
      ReconciliationSummary templates =
          reconcileBucket(minioConfig.getTemplatesBucket(), referencedTemplateObjects());
      ReconciliationSummary generated =
          reconcileBucket(minioConfig.getGeneratedBucket(), referencedGeneratedObjects());
      log.info(
          "Storage reconciliation done: templates(scanned={},deleted={}) generated(scanned={},deleted={})",
          templates.scanned(),
          templates.deleted(),
          generated.scanned(),
          generated.deleted());
    } catch (RuntimeException e) {
      log.error("Storage reconciliation failed: {}", e.getClass().getSimpleName());
    }
  }

  /** Xóa các object trong bucket không nằm trong tập tham chiếu và cũ hơn khoảng ân hạn. */
  public ReconciliationSummary reconcileBucket(String bucket, Set<String> referenced) {
    Instant cutoff = Instant.now().minus(Duration.ofHours(Math.max(0, graceHours)));
    List<MinioDocumentStorageService.StoredObject> objects = storage.listObjects(bucket);
    int deleted = 0;
    for (MinioDocumentStorageService.StoredObject object : objects) {
      if (referenced.contains(object.objectName())) continue;
      // Bỏ qua object thiếu thời gian sửa hoặc còn trong khoảng ân hạn (có thể đang được ghi).
      if (object.lastModified() == null || object.lastModified().isAfter(cutoff)) continue;
      storage.deleteObject(bucket, object.objectName());
      deleted++;
    }
    return new ReconciliationSummary(objects.size(), deleted, objects.size() - deleted);
  }

  private Set<String> referencedTemplateObjects() {
    Set<String> referenced = new HashSet<>();
    templateRepository
        .findAll()
        .forEach(
            template -> {
              if (template.getTemplateObjectName() != null) {
                referenced.add(template.getTemplateObjectName());
              }
            });
    versionRepository
        .findAll()
        .forEach(
            version -> {
              if (version.getTemplateObjectName() != null) {
                referenced.add(version.getTemplateObjectName());
              }
            });
    return referenced;
  }

  private Set<String> referencedGeneratedObjects() {
    Set<String> referenced = new HashSet<>();
    generatedRepository
        .findAll()
        .forEach(
            generated -> {
              if (generated.getGeneratedObjectName() != null) {
                referenced.add(generated.getGeneratedObjectName());
              }
            });
    return referenced;
  }
}
