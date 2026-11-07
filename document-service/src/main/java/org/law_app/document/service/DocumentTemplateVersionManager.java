package org.law_app.document.service;

import java.io.InputStream;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.law_app.document.domain.DocumentTemplate;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.law_app.document.domain.DocumentTemplateVersion;
import org.law_app.document.repository.DocumentTemplateRepository;
import org.law_app.document.repository.DocumentTemplateVersionRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Creates and resolves immutable template content snapshots and lazily upgrades pre-versioning
 * records. Lazy migration lets a rolling deployment use the existing Mongo data without downtime.
 */
@Service
@RequiredArgsConstructor
public class DocumentTemplateVersionManager {
  private final DocumentTemplateRepository templateRepository;
  private final DocumentTemplateVersionRepository versionRepository;
  private final MinioDocumentStorageService storage;
  private final MongoTemplate mongoTemplate;

  public DocumentTemplate prepareAggregate(DocumentTemplate template) {
    if (template.getRevision() != null) return template;
    mongoTemplate.updateFirst(
        Query.query(Criteria.where("_id").is(template.getId()).and("revision").exists(false)),
        Update.update("revision", 0L),
        DocumentTemplate.class);
    return templateRepository.findById(template.getId()).orElse(template);
  }

  public DocumentTemplateVersion ensureLatestVersion(DocumentTemplate rawTemplate) {
    DocumentTemplate template = prepareAggregate(rawTemplate);
    if (template.getLatestVersionId() != null) {
      return versionRepository
          .findById(template.getLatestVersionId())
          .orElseThrow(
              () ->
                  new ResponseStatusException(
                      HttpStatus.CONFLICT, "Metadata phiên bản mẫu không nhất quán"));
    }

    DocumentTemplateVersion existing =
        versionRepository
            .findByTemplateIdAndVersionNumber(template.getId(), Math.max(template.getVersion(), 1))
            .orElseGet(
                () -> saveSnapshot(template, "Legacy data migration", template.getEffectiveFrom()));
    template.setLatestVersionId(existing.getId());
    template.setVersion(existing.getVersionNumber());
    template.setContentSha256(existing.getContentSha256());
    if (template.getStatus() == DocumentTemplateStatus.ACTIVE) {
      template.setActiveVersionId(existing.getId());
      template.setHasUnpublishedChanges(false);
    }
    templateRepository.save(template);
    return existing;
  }

  public DocumentTemplateVersion activeVersion(DocumentTemplate rawTemplate) {
    DocumentTemplate template = prepareAggregate(rawTemplate);
    ensureLatestVersion(template);
    String versionId = template.getActiveVersionId();
    if (versionId == null) {
      // Reload because lazy migration may have set the pointer on a separately-loaded instance.
      versionId =
          templateRepository
              .findById(template.getId())
              .map(DocumentTemplate::getActiveVersionId)
              .orElse(null);
    }
    if (versionId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mẫu chưa có phiên bản đã publish");
    }
    return versionRepository
        .findById(versionId)
        .filter(version -> version.getTemplateId().equals(template.getId()))
        .orElseThrow(
            () ->
                new ResponseStatusException(
                    HttpStatus.CONFLICT, "Không tìm thấy phiên bản mẫu đã publish"));
  }

  public DocumentTemplateVersion saveSnapshot(
      DocumentTemplate template, String changeReason, java.time.Instant effectiveFrom) {
    String hash = template.getContentSha256();
    if (hash == null || hash.isBlank()) {
      try (InputStream input =
          storage.getObject(template.getTemplateBucket(), template.getTemplateObjectName())) {
        hash = DocumentHashing.sha256(input.readAllBytes());
      } catch (ResponseStatusException e) {
        throw e;
      } catch (Exception e) {
        throw new ResponseStatusException(
            HttpStatus.INTERNAL_SERVER_ERROR, "Không tính được checksum file mẫu");
      }
    }
    DocumentTemplateVersion version =
        DocumentTemplateVersion.builder()
            .id(UUID.randomUUID().toString())
            .templateId(template.getId())
            .versionNumber(Math.max(template.getVersion(), 1))
            .previousVersionId(template.getLatestVersionId())
            .name(template.getName())
            .description(template.getDescription())
            .originalFileName(template.getOriginalFileName())
            .templateObjectName(template.getTemplateObjectName())
            .templateBucket(template.getTemplateBucket())
            .contentType(template.getContentType())
            .fileSize(template.getFileSize())
            .contentSha256(hash)
            .fields(DocumentTemplateCopies.fields(template.getFields()))
            .serviceId(template.getServiceId())
            .serviceName(template.getServiceName())
            .tags(
                template.getTags() == null
                    ? java.util.List.of()
                    : java.util.List.copyOf(template.getTags()))
            .changeReason(blankToNull(changeReason))
            .effectiveFrom(effectiveFrom)
            .createdByUserId(org.law_app.document.web.CurrentUser.id())
            .build();
    return versionRepository.save(version);
  }

  public void deleteSnapshot(String id) {
    versionRepository.deleteById(id);
  }

  public DocumentTemplateVersion findVersion(String templateId, String versionId) {
    return versionRepository
        .findById(versionId)
        .filter(version -> version.getTemplateId().equals(templateId))
        .orElseThrow(
            () ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phiên bản mẫu"));
  }

  private String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
