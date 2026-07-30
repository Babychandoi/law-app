package org.law_app.document.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.Normalizer;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.law_app.document.config.MinioConfig;
import org.law_app.document.domain.DataClassification;
import org.law_app.document.domain.DocumentFieldInputType;
import org.law_app.document.domain.DocumentTemplate;
import org.law_app.document.domain.DocumentTemplateField;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.law_app.document.domain.DocumentTemplateVersion;
import org.law_app.document.repository.DocumentTemplateRepository;
import org.law_app.document.repository.DocumentTemplateVersionRepository;
import org.law_app.document.web.CurrentUser;
import org.law_app.document.web.Dtos.ApplyMappingsRequest;
import org.law_app.document.web.Dtos.DocumentTemplateResponse;
import org.law_app.document.web.Dtos.GenerateDocumentRequest;
import org.law_app.document.web.Dtos.MappingRequest;
import org.law_app.document.web.Dtos.PageResponse;
import org.law_app.document.web.Dtos.PublishTemplateRequest;
import org.law_app.document.web.Dtos.RestoreVersionRequest;
import org.law_app.document.web.Dtos.TemplateDryRunResponse;
import org.law_app.document.web.Dtos.TemplateFieldRequest;
import org.law_app.document.web.Dtos.TemplateFieldResponse;
import org.law_app.document.web.Dtos.TemplatePreviewResponse;
import org.law_app.document.web.Dtos.TemplateVersionResponse;
import org.law_app.document.web.Dtos.UpdateFieldsRequest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class DocumentTemplateServiceImpl implements DocumentTemplateService {

  private static final long MAX_TEMPLATE_SIZE = 25L * 1024 * 1024;
  private static final int LEGACY_LIST_LIMIT = 200;
  private static final Set<String> TEMPLATE_SORT_FIELDS =
      Set.of("updatedAt", "createdAt", "name", "version", "publishedAt");

  private final DocumentTemplateRepository repository;
  private final DocumentTemplateVersionRepository versionRepository;
  private final MinioConfig minioConfig;
  private final MinioDocumentStorageService storage;
  private final DocxTemplateEngine docxTemplateEngine;
  private final DocumentTemplateVersionManager versionManager;
  private final DocumentValueValidator valueValidator;
  private final DocumentAuditService auditService;
  private final DocumentMalwareScanner malwareScanner;
  private final MongoTemplate mongoTemplate;

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentTemplateResponse uploadTemplate(
      MultipartFile file, String name, String description) {
    validateTemplateUpload(file, name, description);
    UploadPayload payload = readUpload(file);
    byte[] bytes = payload.bytes();
    Map<String, Integer> placeholders =
        docxTemplateEngine.countPlaceholders(new ByteArrayInputStream(bytes));
    if (placeholders.isEmpty()) {
      throw badRequest("File mẫu chưa có placeholder ${key}");
    }
    List<DocumentTemplateField> fields = new ArrayList<>();
    int order = 1;
    for (String key : placeholders.keySet()) {
      fields.add(
          DocumentTemplateField.builder()
              .fieldKey(key)
              .label("")
              .inputType(DocumentFieldInputType.TEXT)
              .required(true)
              .sortOrder(order++)
              .dataClassification(DataClassification.INTERNAL)
              .build());
    }
    return createInitialTemplate(
        bytes, file, name, description, fields, "Uploaded DOCX template", payload.scanStatus());
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public TemplatePreviewResponse uploadRaw(MultipartFile file, String name, String description) {
    validateTemplateUpload(file, name, description);
    UploadPayload payload = readUpload(file);
    byte[] bytes = payload.bytes();
    String html = docxTemplateEngine.toHtml(new ByteArrayInputStream(bytes));
    DocumentTemplateResponse response =
        createInitialTemplate(
            bytes, file, name, description, List.of(), "Uploaded raw DOCX", payload.scanStatus());
    return new TemplatePreviewResponse(response.id(), response.name(), html);
  }

  private DocumentTemplateResponse createInitialTemplate(
      byte[] bytes,
      MultipartFile file,
      String name,
      String description,
      List<DocumentTemplateField> fields,
      String changeReason,
      DocumentMalwareScanner.ScanStatus scanStatus) {
    String id = UUID.randomUUID().toString();
    String original = safeOriginalName(file.getOriginalFilename());
    String objectName = immutableObjectName(id, 1, original);
    String bucket = minioConfig.getTemplatesBucket();
    String hash = DocumentHashing.sha256(bytes);
    storage.uploadBytes(bucket, objectName, bytes, DocxTemplateEngine.DOCX_CONTENT_TYPE);

    DocumentTemplate template =
        DocumentTemplate.builder()
            .id(id)
            .name(name.trim())
            .description(blankToNull(description))
            .status(DocumentTemplateStatus.DRAFT)
            .version(1)
            .hasUnpublishedChanges(true)
            .originalFileName(original)
            .templateObjectName(objectName)
            .templateBucket(bucket)
            .contentType(DocxTemplateEngine.DOCX_CONTENT_TYPE)
            .fileSize(bytes.length)
            .contentSha256(hash)
            .fields(DocumentTemplateCopies.fields(fields))
            .createdByUserId(CurrentUser.id())
            .updatedByUserId(CurrentUser.id())
            .build();

    DocumentTemplateVersion snapshot = null;
    boolean aggregateSaved = false;
    try {
      snapshot = versionManager.saveSnapshot(template, changeReason, null);
      template.setLatestVersionId(snapshot.getId());
      DocumentTemplate saved = repository.save(template);
      aggregateSaved = true;
      auditService.record(
          DocumentAuditService.TEMPLATE,
          saved.getId(),
          "TEMPLATE_CREATED",
          null,
          DocumentTemplateStatus.DRAFT.name(),
          Map.of(
              "versionId", snapshot.getId(),
              "version", String.valueOf(snapshot.getVersionNumber()),
              "sha256", hash,
              "malwareScan", scanStatus.name()));
      return toResponse(saved);
    } catch (RuntimeException e) {
      if (!aggregateSaved) {
        if (snapshot != null) safeDeleteSnapshot(snapshot.getId());
        storage.deleteObject(bucket, objectName);
      }
      throw e;
    }
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public TemplatePreviewResponse preview(String id) {
    DocumentTemplate template = findTemplate(id);
    DocumentTemplateVersion latest = versionManager.ensureLatestVersion(template);
    String html =
        docxTemplateEngine.toHtml(
            storage.getObject(latest.getTemplateBucket(), latest.getTemplateObjectName()));
    return new TemplatePreviewResponse(template.getId(), latest.getName(), html);
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public TemplateDryRunResponse dryRun(String id, GenerateDocumentRequest request) {
    DocumentTemplate template = findTemplate(id);
    DocumentTemplateVersion latest = versionManager.ensureLatestVersion(template);
    valueValidator.validateSchema(latest.getFields());
    Map<String, String> values =
        valueValidator.normalizeAndValidate(latest.getFields(), request.values());
    byte[] rendered =
        docxTemplateEngine.render(
            storage.getObject(latest.getTemplateBucket(), latest.getTemplateObjectName()), values);
    docxTemplateEngine.validatePackage(new ByteArrayInputStream(rendered));
    String hash = DocumentHashing.sha256(rendered);
    auditService.record(
        DocumentAuditService.TEMPLATE,
        template.getId(),
        "TEMPLATE_DRY_RUN",
        template.getStatus().name(),
        template.getStatus().name(),
        Map.of(
            "versionId", latest.getId(),
            "outputSha256", hash,
            "outputSize", String.valueOf(rendered.length)));
    return new TemplateDryRunResponse(
        template.getId(), latest.getId(), latest.getVersionNumber(), true, rendered.length, hash);
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentTemplateResponse applyMappings(String id, ApplyMappingsRequest request) {
    DocumentTemplate template = findTemplate(id);
    assertEditable(template);
    assertExpectedRevision(template, request.expectedRevision());
    DocumentTemplateVersion latest = versionManager.ensureLatestVersion(template);

    Set<String> keys = new LinkedHashSet<>();
    Set<String> samples = new LinkedHashSet<>();
    List<DocxTemplateEngine.TextMapping> mappings = new ArrayList<>();
    for (MappingRequest mapping : request.mappings()) {
      if (!keys.add(mapping.fieldKey())) throw badRequest("Key bị trùng: " + mapping.fieldKey());
      if (!samples.add(mapping.sampleText())) {
        throw badRequest("Đoạn text mapping bị trùng: " + mapping.fieldKey());
      }
      mappings.add(
          new DocxTemplateEngine.TextMapping(
              mapping.sampleText(),
              mapping.fieldKey(),
              mapping.expectedOccurrences() == null ? 1 : mapping.expectedOccurrences()));
    }

    byte[] updated =
        docxTemplateEngine.applyMappings(
            storage.getObject(latest.getTemplateBucket(), latest.getTemplateObjectName()),
            mappings);
    List<DocumentTemplateField> fields =
        request.mappings().stream()
            .map(this::toField)
            .sorted(Comparator.comparingInt(DocumentTemplateField::getSortOrder))
            .toList();
    valueValidator.validateSchema(fields);

    int nextVersion = template.getVersion() + 1;
    String objectName =
        immutableObjectName(template.getId(), nextVersion, template.getOriginalFileName());
    storage.uploadBytes(
        minioConfig.getTemplatesBucket(),
        objectName,
        updated,
        DocxTemplateEngine.DOCX_CONTENT_TYPE);

    DocumentTemplateVersion snapshot = null;
    boolean aggregateSaved = false;
    try {
      template.setVersion(nextVersion);
      template.setTemplateBucket(minioConfig.getTemplatesBucket());
      template.setTemplateObjectName(objectName);
      template.setFileSize(updated.length);
      template.setContentSha256(DocumentHashing.sha256(updated));
      template.setFields(DocumentTemplateCopies.fields(fields));
      template.setHasUnpublishedChanges(true);
      template.setUpdatedByUserId(CurrentUser.id());
      if (template.getActiveVersionId() == null) template.setStatus(DocumentTemplateStatus.DRAFT);
      snapshot =
          versionManager.saveSnapshot(
              template, defaultReason(request.changeReason(), "Mapped DOCX placeholders"), null);
      template.setLatestVersionId(snapshot.getId());
      DocumentTemplate saved = repository.save(template);
      aggregateSaved = true;
      auditVersionCreated(saved, snapshot, "MAPPINGS_APPLIED");
      return toResponse(saved);
    } catch (RuntimeException e) {
      if (!aggregateSaved) {
        if (snapshot != null) safeDeleteSnapshot(snapshot.getId());
        storage.deleteObject(minioConfig.getTemplatesBucket(), objectName);
      }
      throw concurrencyAware(e);
    }
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public List<DocumentTemplateResponse> listTemplates(String status) {
    return pageTemplates(null, status, null, 0, LEGACY_LIST_LIMIT, "updatedAt", "desc").content();
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public PageResponse<DocumentTemplateResponse> pageTemplates(
      String query,
      String status,
      String serviceId,
      int page,
      int size,
      String sort,
      String direction) {
    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), 100);
    String sortField = TEMPLATE_SORT_FIELDS.contains(sort) ? sort : "updatedAt";
    Sort.Direction sortDirection =
        "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
    Criteria criteria = templateCriteria(query, status, serviceId);
    Query countQuery = Query.query(criteria);
    long total = mongoTemplate.count(countQuery, DocumentTemplate.class);
    Query dataQuery =
        Query.query(criteria)
            .with(PageRequest.of(safePage, safeSize, Sort.by(sortDirection, sortField)));
    List<DocumentTemplateResponse> content =
        mongoTemplate.find(dataQuery, DocumentTemplate.class).stream()
            .map(this::toResponseForViewer)
            .toList();
    int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / safeSize);
    return new PageResponse<>(
        content,
        safePage,
        safeSize,
        total,
        totalPages,
        safePage == 0,
        totalPages == 0 || safePage >= totalPages - 1);
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public DocumentTemplateResponse getTemplate(String id) {
    DocumentTemplate template = findTemplate(id);
    if (!CurrentUser.isAdmin() && template.getStatus() != DocumentTemplateStatus.ACTIVE) {
      throw notFound();
    }
    return toResponseForViewer(template);
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentTemplateResponse updateFields(String id, UpdateFieldsRequest request) {
    DocumentTemplate template = findTemplate(id);
    assertEditable(template);
    assertExpectedRevision(template, request.expectedRevision());
    DocumentTemplateVersion latest = versionManager.ensureLatestVersion(template);
    List<DocumentTemplateField> fields =
        request.fields().stream()
            .map(this::toField)
            .sorted(Comparator.comparingInt(DocumentTemplateField::getSortOrder))
            .toList();
    assertFieldsMatchDocx(latest, fields);
    valueValidator.validateSchema(fields);

    template.setVersion(template.getVersion() + 1);
    template.setFields(DocumentTemplateCopies.fields(fields));
    template.setHasUnpublishedChanges(true);
    template.setUpdatedByUserId(CurrentUser.id());
    DocumentTemplateVersion snapshot = null;
    DocumentTemplate saved;
    try {
      snapshot =
          versionManager.saveSnapshot(
              template, defaultReason(request.changeReason(), "Updated field schema"), null);
      template.setLatestVersionId(snapshot.getId());
      saved = repository.save(template);
    } catch (RuntimeException e) {
      if (snapshot != null) safeDeleteSnapshot(snapshot.getId());
      throw concurrencyAware(e);
    }
    auditVersionCreated(saved, snapshot, "FIELDS_UPDATED");
    return toResponse(saved);
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentTemplateResponse publish(String id, PublishTemplateRequest request) {
    DocumentTemplate template = findTemplate(id);
    assertEditable(template);
    assertExpectedRevision(template, request == null ? null : request.expectedRevision());
    DocumentTemplateVersion latest = versionManager.ensureLatestVersion(template);

    boolean createSnapshot = applyPublishPayload(template, request);
    DocumentTemplateVersion publishing = latest;
    DocumentTemplateVersion createdSnapshot = null;
    if (createSnapshot) {
      template.setVersion(template.getVersion() + 1);
      template.setHasUnpublishedChanges(true);
      template.setUpdatedByUserId(CurrentUser.id());
      createdSnapshot =
          versionManager.saveSnapshot(
              template,
              defaultReason(request.changeReason(), "Saved and published template"),
              request.effectiveFrom());
      template.setLatestVersionId(createdSnapshot.getId());
      publishing = createdSnapshot;
    }

    DocumentTemplateStatus previousStatus = template.getStatus();
    DocumentTemplate saved;
    try {
      validateForPublish(publishing);
      template.setActiveVersionId(publishing.getId());
      template.setStatus(DocumentTemplateStatus.ACTIVE);
      template.setHasUnpublishedChanges(false);
      template.setPublishedByUserId(CurrentUser.id());
      template.setPublishedAt(Instant.now());
      template.setEffectiveFrom(
          request != null && request.effectiveFrom() != null
              ? request.effectiveFrom()
              : publishing.getEffectiveFrom());
      template.setUpdatedByUserId(CurrentUser.id());
      copyVersionContentToAggregate(template, publishing);
      saved = repository.save(template);
    } catch (RuntimeException e) {
      if (createdSnapshot != null) safeDeleteSnapshot(createdSnapshot.getId());
      throw concurrencyAware(e);
    }
    auditService.record(
        DocumentAuditService.TEMPLATE,
        saved.getId(),
        "TEMPLATE_PUBLISHED",
        previousStatus.name(),
        DocumentTemplateStatus.ACTIVE.name(),
        Map.of(
            "versionId", publishing.getId(),
            "version", String.valueOf(publishing.getVersionNumber()),
            "sha256", publishing.getContentSha256()));
    return toResponse(saved);
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentTemplateResponse archive(String id) {
    DocumentTemplate template = findTemplate(id);
    if (template.getStatus() == DocumentTemplateStatus.ARCHIVED) return toResponse(template);
    DocumentTemplateStatus previous = template.getStatus();
    template.setStatus(DocumentTemplateStatus.ARCHIVED);
    template.setArchivedAt(Instant.now());
    template.setArchivedByUserId(CurrentUser.id());
    template.setUpdatedByUserId(CurrentUser.id());
    DocumentTemplate saved = repository.save(template);
    auditService.record(
        DocumentAuditService.TEMPLATE,
        saved.getId(),
        "TEMPLATE_ARCHIVED",
        previous.name(),
        DocumentTemplateStatus.ARCHIVED.name(),
        Map.of("activeVersionId", nullToEmpty(saved.getActiveVersionId())));
    return toResponse(saved);
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentTemplateResponse restore(String id) {
    DocumentTemplate template = findTemplate(id);
    if (template.getStatus() != DocumentTemplateStatus.ARCHIVED) {
      return toResponse(template);
    }
    DocumentTemplateStatus restoredStatus =
        template.getActiveVersionId() == null
            ? DocumentTemplateStatus.DRAFT
            : DocumentTemplateStatus.ACTIVE;
    template.setStatus(restoredStatus);
    template.setArchivedAt(null);
    template.setArchivedByUserId(null);
    template.setUpdatedByUserId(CurrentUser.id());
    DocumentTemplate saved = repository.save(template);
    auditService.record(
        DocumentAuditService.TEMPLATE,
        saved.getId(),
        "TEMPLATE_RESTORED",
        DocumentTemplateStatus.ARCHIVED.name(),
        restoredStatus.name(),
        Map.of("activeVersionId", nullToEmpty(saved.getActiveVersionId())));
    return toResponse(saved);
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public PageResponse<TemplateVersionResponse> listVersions(String id, int page, int size) {
    DocumentTemplate template = findTemplate(id);
    versionManager.ensureLatestVersion(template);
    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), 100);
    var result =
        versionRepository.findByTemplateId(
            id, PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "versionNumber")));
    return new PageResponse<>(
        result.stream().map(version -> toVersionResponse(template, version)).toList(),
        result.getNumber(),
        result.getSize(),
        result.getTotalElements(),
        result.getTotalPages(),
        result.isFirst(),
        result.isLast());
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public TemplateVersionResponse getVersion(String id, String versionId) {
    DocumentTemplate template = findTemplate(id);
    return toVersionResponse(template, versionManager.findVersion(id, versionId));
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public TemplatePreviewResponse previewVersion(String id, String versionId) {
    findTemplate(id);
    DocumentTemplateVersion version = versionManager.findVersion(id, versionId);
    String html =
        docxTemplateEngine.toHtml(
            storage.getObject(version.getTemplateBucket(), version.getTemplateObjectName()));
    return new TemplatePreviewResponse(version.getId(), version.getName(), html);
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentTemplateResponse restoreVersion(
      String id, String versionId, RestoreVersionRequest request) {
    DocumentTemplate template = findTemplate(id);
    assertEditable(template);
    assertExpectedRevision(template, request.expectedRevision());
    DocumentTemplateVersion selected = versionManager.findVersion(id, versionId);
    versionManager.ensureLatestVersion(template);

    template.setVersion(template.getVersion() + 1);
    copyVersionContentToAggregate(template, selected);
    template.setVersion(Math.max(template.getVersion(), selected.getVersionNumber() + 1));
    template.setHasUnpublishedChanges(true);
    template.setUpdatedByUserId(CurrentUser.id());
    DocumentTemplateVersion restored = null;
    DocumentTemplate saved;
    try {
      restored =
          versionManager.saveSnapshot(
              template,
              request.changeReason() + " (restored from v" + selected.getVersionNumber() + ")",
              selected.getEffectiveFrom());
      template.setLatestVersionId(restored.getId());
      saved = repository.save(template);
    } catch (RuntimeException e) {
      if (restored != null) safeDeleteSnapshot(restored.getId());
      throw concurrencyAware(e);
    }
    auditService.record(
        DocumentAuditService.TEMPLATE,
        saved.getId(),
        "TEMPLATE_VERSION_RESTORED",
        saved.getStatus().name(),
        saved.getStatus().name(),
        Map.of(
            "sourceVersionId", selected.getId(),
            "newVersionId", restored.getId(),
            "version", String.valueOf(restored.getVersionNumber())));
    return toResponse(saved);
  }

  DocumentTemplate findTemplate(String id) {
    DocumentTemplate template = repository.findById(id).orElseThrow(this::notFound);
    return versionManager.prepareAggregate(template);
  }

  private Criteria templateCriteria(String query, String status, String serviceId) {
    List<Criteria> criteria = new ArrayList<>();
    if (!CurrentUser.isAdmin()) {
      criteria.add(Criteria.where("status").is(DocumentTemplateStatus.ACTIVE));
    } else if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
      criteria.add(Criteria.where("status").is(parseTemplateStatus(status)));
    }
    if (serviceId != null && !serviceId.isBlank()) {
      criteria.add(Criteria.where("serviceId").is(serviceId.trim()));
    }
    if (query != null && !query.isBlank()) {
      Pattern search = Pattern.compile(Pattern.quote(query.trim()), Pattern.CASE_INSENSITIVE);
      criteria.add(
          new Criteria()
              .orOperator(
                  Criteria.where("name").regex(search),
                  Criteria.where("description").regex(search),
                  Criteria.where("serviceName").regex(search),
                  Criteria.where("tags").regex(search)));
    }
    return criteria.isEmpty() ? new Criteria() : new Criteria().andOperator(criteria);
  }

  private boolean applyPublishPayload(DocumentTemplate template, PublishTemplateRequest request) {
    if (request == null) return false;
    boolean changed = false;
    if (request.fields() != null) {
      List<DocumentTemplateField> fields =
          request.fields().stream()
              .map(this::toField)
              .sorted(Comparator.comparingInt(DocumentTemplateField::getSortOrder))
              .toList();
      DocumentTemplateVersion latest = versionManager.ensureLatestVersion(template);
      assertFieldsMatchDocx(latest, fields);
      valueValidator.validateSchema(fields);
      template.setFields(DocumentTemplateCopies.fields(fields));
      changed = true;
    }
    if (request.name() != null) {
      if (request.name().isBlank()) throw badRequest("Tên mẫu là bắt buộc");
      template.setName(request.name().trim());
      changed = true;
    }
    if (request.description() != null) {
      template.setDescription(blankToNull(request.description()));
      changed = true;
    }
    if (request.serviceId() != null) {
      template.setServiceId(blankToNull(request.serviceId()));
      changed = true;
    }
    if (request.serviceName() != null) {
      template.setServiceName(blankToNull(request.serviceName()));
      changed = true;
    }
    if (request.tags() != null) {
      template.setTags(normalizeTags(request.tags()));
      changed = true;
    }
    if (request.effectiveFrom() != null) {
      template.setEffectiveFrom(request.effectiveFrom());
      changed = true;
    }
    return changed;
  }

  private void validateForPublish(DocumentTemplateVersion version) {
    valueValidator.validateSchema(version.getFields());
    Map<String, Integer> counts =
        docxTemplateEngine.countPlaceholders(
            storage.getObject(version.getTemplateBucket(), version.getTemplateObjectName()));
    Set<String> schemaKeys =
        version.getFields().stream()
            .map(DocumentTemplateField::getFieldKey)
            .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
    // Placeholder dẫn xuất "số tiền bằng chữ" ({key}_bangchu) hợp lệ, không cần là field cấu hình.
    Set<String> allowedDerived = DocumentDerivedValues.allowedDerivedKeys(version.getFields());
    Set<String> placeholderKeys = new LinkedHashSet<>(counts.keySet());
    placeholderKeys.removeAll(allowedDerived);
    if (!placeholderKeys.equals(schemaKeys)) {
      Set<String> missingSchema = new LinkedHashSet<>(placeholderKeys);
      missingSchema.removeAll(schemaKeys);
      Set<String> missingDocx = new LinkedHashSet<>(schemaKeys);
      missingDocx.removeAll(placeholderKeys);
      throw badRequest(
          "Placeholder và schema không khớp. Chưa cấu hình: "
              + missingSchema
              + "; không tồn tại trong DOCX: "
              + missingDocx);
    }
    if (counts.values().stream().anyMatch(count -> count == null || count < 1)) {
      throw badRequest("Mỗi field phải xuất hiện ít nhất một lần trong DOCX");
    }

    Map<String, String> trialValues = new LinkedHashMap<>();
    version
        .getFields()
        .forEach(
            field ->
                trialValues.put(
                    field.getFieldKey(),
                    field.getDefaultValue() == null
                        ? "[[" + field.getFieldKey() + "]]"
                        : field.getDefaultValue()));
    byte[] trial =
        docxTemplateEngine.render(
            storage.getObject(version.getTemplateBucket(), version.getTemplateObjectName()),
            DocumentDerivedValues.augment(version.getFields(), trialValues));
    docxTemplateEngine.validatePackage(new ByteArrayInputStream(trial));
  }

  private void assertFieldsMatchDocx(
      DocumentTemplateVersion version, List<DocumentTemplateField> fields) {
    Set<String> placeholders =
        docxTemplateEngine
            .extractPlaceholders(
                storage.getObject(version.getTemplateBucket(), version.getTemplateObjectName()))
            .stream()
            .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
    Set<String> submitted =
        fields.stream()
            .map(DocumentTemplateField::getFieldKey)
            .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
    // Placeholder dẫn xuất {key}_bangchu không cần khai báo field — bỏ ra trước khi so khớp.
    Set<String> effectivePlaceholders = new LinkedHashSet<>(placeholders);
    effectivePlaceholders.removeAll(DocumentDerivedValues.allowedDerivedKeys(fields));
    if (!submitted.equals(effectivePlaceholders)) {
      throw badRequest("Danh sách key phải khớp chính xác với placeholder trong file mẫu");
    }
  }

  private DocumentTemplateField toField(TemplateFieldRequest field) {
    return DocumentTemplateField.builder()
        .fieldKey(field.fieldKey())
        .label(field.label() == null ? null : field.label().trim())
        .helpText(blankToNull(field.helpText()))
        .inputType(field.inputType() == null ? DocumentFieldInputType.TEXT : field.inputType())
        .required(field.required())
        .sortOrder(field.sortOrder())
        .defaultValue(field.defaultValue())
        .maxLength(field.maxLength())
        .validationPattern(blankToNull(field.validationPattern()))
        .minimum(field.minimum())
        .maximum(field.maximum())
        .options(field.options() == null ? List.of() : List.copyOf(field.options()))
        .dataClassification(
            field.dataClassification() == null
                ? DataClassification.INTERNAL
                : field.dataClassification())
        .build();
  }

  private DocumentTemplateField toField(MappingRequest field) {
    return DocumentTemplateField.builder()
        .fieldKey(field.fieldKey())
        .label(field.label() == null ? null : field.label().trim())
        .helpText(blankToNull(field.helpText()))
        .inputType(field.inputType() == null ? DocumentFieldInputType.TEXT : field.inputType())
        .required(field.required())
        .sortOrder(field.sortOrder())
        .defaultValue(field.defaultValue())
        .maxLength(field.maxLength())
        .validationPattern(blankToNull(field.validationPattern()))
        .minimum(field.minimum())
        .maximum(field.maximum())
        .options(field.options() == null ? List.of() : List.copyOf(field.options()))
        .dataClassification(
            field.dataClassification() == null
                ? DataClassification.INTERNAL
                : field.dataClassification())
        .build();
  }

  private void copyVersionContentToAggregate(
      DocumentTemplate template, DocumentTemplateVersion version) {
    int currentVersionNumber = template.getVersion();
    template.setName(version.getName());
    template.setDescription(version.getDescription());
    template.setOriginalFileName(version.getOriginalFileName());
    template.setTemplateObjectName(version.getTemplateObjectName());
    template.setTemplateBucket(version.getTemplateBucket());
    template.setContentType(version.getContentType());
    template.setFileSize(version.getFileSize());
    template.setContentSha256(version.getContentSha256());
    template.setFields(DocumentTemplateCopies.fields(version.getFields()));
    template.setServiceId(version.getServiceId());
    template.setServiceName(version.getServiceName());
    template.setTags(version.getTags() == null ? List.of() : List.copyOf(version.getTags()));
    // Publishing an existing latest version keeps its number; restoring keeps the allocated new
    // number.
    template.setVersion(Math.max(currentVersionNumber, version.getVersionNumber()));
  }

  private DocumentTemplateResponse toResponseForViewer(DocumentTemplate template) {
    if (CurrentUser.isAdmin() || template.getActiveVersionId() == null) return toResponse(template);
    DocumentTemplateVersion active = versionManager.activeVersion(template);
    return toResponse(template, active);
  }

  DocumentTemplateResponse toResponse(DocumentTemplate template) {
    return toResponse(template, null);
  }

  private DocumentTemplateResponse toResponse(
      DocumentTemplate template, DocumentTemplateVersion contentOverride) {
    List<DocumentTemplateField> fields =
        contentOverride == null ? template.getFields() : contentOverride.getFields();
    List<TemplateFieldResponse> fieldResponses =
        fields.stream()
            .sorted(Comparator.comparingInt(DocumentTemplateField::getSortOrder))
            .map(this::toFieldResponse)
            .toList();
    return new DocumentTemplateResponse(
        template.getId(),
        contentOverride == null ? template.getName() : contentOverride.getName(),
        contentOverride == null ? template.getDescription() : contentOverride.getDescription(),
        template.getStatus(),
        contentOverride == null ? template.getVersion() : contentOverride.getVersionNumber(),
        template.getLatestVersionId(),
        template.getActiveVersionId(),
        template.isHasUnpublishedChanges(),
        contentOverride == null
            ? template.getOriginalFileName()
            : contentOverride.getOriginalFileName(),
        contentOverride == null ? template.getFileSize() : contentOverride.getFileSize(),
        contentOverride == null ? template.getContentSha256() : contentOverride.getContentSha256(),
        fieldResponses,
        contentOverride == null ? template.getServiceId() : contentOverride.getServiceId(),
        contentOverride == null ? template.getServiceName() : contentOverride.getServiceName(),
        contentOverride == null ? template.getTags() : contentOverride.getTags(),
        template.getCreatedByUserId(),
        template.getUpdatedByUserId(),
        template.getPublishedByUserId(),
        template.getEffectiveFrom(),
        template.getPublishedAt(),
        template.getCreatedAt(),
        template.getUpdatedAt(),
        template.getRevision());
  }

  private TemplateFieldResponse toFieldResponse(DocumentTemplateField field) {
    return new TemplateFieldResponse(
        field.getFieldKey(),
        field.getLabel(),
        field.getHelpText(),
        field.getInputType(),
        field.isRequired(),
        field.getSortOrder(),
        field.getDefaultValue(),
        field.getMaxLength(),
        field.getValidationPattern(),
        field.getMinimum(),
        field.getMaximum(),
        field.getOptions() == null ? List.of() : field.getOptions(),
        field.getDataClassification());
  }

  private TemplateVersionResponse toVersionResponse(
      DocumentTemplate template, DocumentTemplateVersion version) {
    return new TemplateVersionResponse(
        version.getId(),
        version.getTemplateId(),
        version.getVersionNumber(),
        version.getPreviousVersionId(),
        version.getName(),
        version.getDescription(),
        version.getOriginalFileName(),
        version.getFileSize(),
        version.getContentSha256(),
        version.getFields().stream()
            .sorted(Comparator.comparingInt(DocumentTemplateField::getSortOrder))
            .map(this::toFieldResponse)
            .toList(),
        version.getChangeReason(),
        version.getEffectiveFrom(),
        version.getCreatedByUserId(),
        version.getCreatedAt(),
        version.getId().equals(template.getActiveVersionId()),
        version.getId().equals(template.getLatestVersionId()));
  }

  private void auditVersionCreated(
      DocumentTemplate template, DocumentTemplateVersion snapshot, String action) {
    auditService.record(
        DocumentAuditService.TEMPLATE,
        template.getId(),
        action,
        template.getStatus().name(),
        template.getStatus().name(),
        Map.of(
            "versionId", snapshot.getId(),
            "version", String.valueOf(snapshot.getVersionNumber()),
            "sha256", snapshot.getContentSha256()));
  }

  private void assertEditable(DocumentTemplate template) {
    if (template.getStatus() == DocumentTemplateStatus.ARCHIVED) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Mẫu đã lưu trữ; hãy khôi phục trước khi chỉnh sửa");
    }
  }

  private void assertExpectedRevision(DocumentTemplate template, Long expectedRevision) {
    if (expectedRevision != null && !expectedRevision.equals(template.getRevision())) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Mẫu đã được người khác cập nhật; vui lòng tải lại");
    }
  }

  private DocumentTemplateStatus parseTemplateStatus(String status) {
    try {
      return DocumentTemplateStatus.valueOf(status.trim().toUpperCase());
    } catch (IllegalArgumentException e) {
      throw badRequest("Trạng thái mẫu không hợp lệ");
    }
  }

  private void validateTemplateUpload(MultipartFile file, String name, String description) {
    if (name == null || name.isBlank()) throw badRequest("Tên mẫu là bắt buộc");
    if (name.trim().length() > 200) throw badRequest("Tên mẫu không được vượt quá 200 ký tự");
    if (description != null && description.length() > 2_000) {
      throw badRequest("Mô tả không được vượt quá 2000 ký tự");
    }
    if (file == null || file.isEmpty()) throw badRequest("File mẫu là bắt buộc");
    String original =
        file.getOriginalFilename() == null
            ? ""
            : file.getOriginalFilename().toLowerCase(java.util.Locale.ROOT);
    if (!original.endsWith(".docx")) throw badRequest("Chỉ hỗ trợ file .docx");
    String contentType = file.getContentType();
    if (contentType != null
        && !contentType.isBlank()
        && !DocxTemplateEngine.DOCX_CONTENT_TYPE.equalsIgnoreCase(contentType)
        && !"application/octet-stream".equalsIgnoreCase(contentType)) {
      throw badRequest("Content-Type file Word không hợp lệ");
    }
    if (file.getSize() > MAX_TEMPLATE_SIZE) {
      throw badRequest("File mẫu không được vượt quá 25MB");
    }
    assertZipMagic(file);
  }

  private void assertZipMagic(MultipartFile file) {
    try (InputStream input = file.getInputStream()) {
      byte[] magic = input.readNBytes(4);
      if (magic.length < 4 || magic[0] != 'P' || magic[1] != 'K') {
        throw badRequest("File .docx không hợp lệ");
      }
    } catch (IOException e) {
      throw badRequest("Không đọc được file Word mẫu");
    }
  }

  private UploadPayload readUpload(MultipartFile file) {
    try {
      byte[] bytes = file.getBytes();
      DocumentMalwareScanner.ScanStatus scanStatus = malwareScanner.scan(bytes);
      docxTemplateEngine.validatePackage(new ByteArrayInputStream(bytes));
      return new UploadPayload(bytes, scanStatus);
    } catch (ResponseStatusException e) {
      throw e;
    } catch (IOException e) {
      throw badRequest("Không đọc được file Word mẫu");
    }
  }

  private String immutableObjectName(String templateId, int version, String originalName) {
    return "templates/"
        + templateId
        + "/v"
        + version
        + "/"
        + UUID.randomUUID()
        + "_"
        + safeFileName(originalName);
  }

  private List<String> normalizeTags(List<String> tags) {
    LinkedHashSet<String> result = new LinkedHashSet<>();
    for (String tag : tags) {
      if (tag != null && !tag.isBlank()) result.add(tag.trim());
    }
    return result.stream().limit(100).toList();
  }

  private String safeOriginalName(String name) {
    if (name == null || name.isBlank()) return "template.docx";
    String leaf = java.nio.file.Path.of(name).getFileName().toString();
    return leaf.length() <= 255 ? leaf : leaf.substring(leaf.length() - 255);
  }

  private String safeFileName(String name) {
    String normalized =
        Normalizer.normalize(
                name == null || name.isBlank() ? "template.docx" : name, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "");
    String safe = normalized.replaceAll("[^a-zA-Z0-9._-]", "_").replaceAll("_+", "_");
    return safe.isBlank() ? "template.docx" : safe;
  }

  private String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }

  private String defaultReason(String reason, String fallback) {
    return reason == null || reason.isBlank() ? fallback : reason.trim();
  }

  private String nullToEmpty(String value) {
    return value == null ? "" : value;
  }

  private void safeDeleteSnapshot(String id) {
    try {
      versionManager.deleteSnapshot(id);
    } catch (RuntimeException ignored) {
      // An immutable orphan can be safely reconciled; never mask the original operation failure.
    }
  }

  private RuntimeException concurrencyAware(RuntimeException exception) {
    if (exception instanceof DuplicateKeyException
        || exception instanceof org.springframework.dao.OptimisticLockingFailureException) {
      return new ResponseStatusException(
          HttpStatus.CONFLICT, "Mẫu đã được cập nhật đồng thời; vui lòng tải lại");
    }
    return exception;
  }

  private ResponseStatusException badRequest(String reason) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, reason);
  }

  private ResponseStatusException notFound() {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy mẫu tài liệu");
  }

  private record UploadPayload(byte[] bytes, DocumentMalwareScanner.ScanStatus scanStatus) {}
}
