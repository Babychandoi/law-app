package org.law_app.document.service;

import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.UUID;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.law_app.document.config.MinioConfig;
import org.law_app.document.domain.DocumentTemplate;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.law_app.document.domain.DocumentTemplateVersion;
import org.law_app.document.domain.DocumentWorkflowStatus;
import org.law_app.document.domain.GeneratedDocument;
import org.law_app.document.domain.LegalDocumentContext;
import org.law_app.document.repository.DocumentTemplateRepository;
import org.law_app.document.repository.GeneratedDocumentRepository;
import org.law_app.document.web.CurrentUser;
import org.law_app.document.web.Dtos.GenerateDocumentRequest;
import org.law_app.document.web.Dtos.GeneratedDocumentResponse;
import org.law_app.document.web.Dtos.LegalContextRequest;
import org.law_app.document.web.Dtos.LegalContextResponse;
import org.law_app.document.web.Dtos.PageResponse;
import org.law_app.document.web.Dtos.WorkflowTransitionRequest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class GeneratedDocumentServiceImpl implements GeneratedDocumentService {
  private static final int LEGACY_LIST_LIMIT = 200;
  private static final Set<String> GENERATED_SORT_FIELDS =
      Set.of("createdAt", "updatedAt", "generatedFileName", "status", "templateNameSnapshot");

  private final DocumentTemplateRepository templateRepository;
  private final GeneratedDocumentRepository generatedRepository;
  private final MinioDocumentStorageService storage;
  private final DocxTemplateEngine docxTemplateEngine;
  private final MinioConfig minioConfig;
  private final DocumentTemplateVersionManager versionManager;
  private final DocumentValueValidator valueValidator;
  private final DocumentAuditService auditService;
  private final SensitiveValueEncryptionService encryptionService;
  private final MongoTemplate mongoTemplate;

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public GeneratedDocumentResponse generate(
      String templateId, GenerateDocumentRequest request, String idempotencyKey) {
    DocumentTemplate template =
        templateRepository
            .findById(templateId)
            .map(versionManager::prepareAggregate)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy mẫu tài liệu"));
    if (template.getStatus() != DocumentTemplateStatus.ACTIVE) {
      throw badRequest("Mẫu tài liệu chưa được publish hoặc đã lưu trữ");
    }
    DocumentTemplateVersion version = versionManager.activeVersion(template);
    Map<String, String> values =
        valueValidator.normalizeAndValidate(version.getFields(), request.values());
    // Trường lặp: dữ liệu dòng bảng (không nằm trong schema field). Giới hạn tổng kích thước.
    Map<String, List<Map<String, String>>> lists = safeLists(request.lists());
    guardListSize(lists);
    LegalDocumentContext context = normalizeContext(request.context(), version);
    // Fingerprint + lưu trữ + mã hóa dùng bản PHẲNG (scalar + giá trị list dạng list[i].child).
    Map<String, String> storedValues = flattenWithLists(values, lists);
    String scope = idempotencyScope(idempotencyKey);
    String fingerprint = fingerprint(version, storedValues, context);

    if (scope != null) {
      GeneratedDocument existing = generatedRepository.findByIdempotencyScope(scope).orElse(null);
      if (existing != null) return idempotentResult(existing, fingerprint);
    }

    // Scalar + placeholder dẫn xuất; danh sách nhân dòng bảng qua renderWithLists.
    Map<String, String> renderValues = DocumentDerivedValues.augment(version.getFields(), values);
    byte[] rendered =
        docxTemplateEngine.renderWithLists(
            storage.getObject(version.getTemplateBucket(), version.getTemplateObjectName()),
            renderValues,
            lists);
    // Ensure the output can be parsed after replacement before it is persisted.
    docxTemplateEngine.validatePackage(new java.io.ByteArrayInputStream(rendered));

    String id = UUID.randomUUID().toString();
    SensitiveValueEncryptionService.EncryptedValues encryptedValues =
        encryptionService.encrypt(storedValues, id, version.getId());
    String fileName = buildGeneratedFileName(version);
    String objectName =
        "generated/" + template.getId() + "/" + version.getId() + "/" + id + "/" + fileName;
    storage.uploadBytes(
        minioConfig.getGeneratedBucket(),
        objectName,
        rendered,
        DocxTemplateEngine.DOCX_CONTENT_TYPE);

    GeneratedDocument generated =
        GeneratedDocument.builder()
            .id(id)
            .templateId(template.getId())
            .templateVersionId(version.getId())
            .templateNameSnapshot(version.getName())
            .templateVersionSnapshot(version.getVersionNumber())
            .templateContentSha256(version.getContentSha256())
            .generatedFileName(fileName)
            .generatedObjectName(objectName)
            .generatedBucket(minioConfig.getGeneratedBucket())
            .generatedContentSha256(DocumentHashing.sha256(rendered))
            .values(Map.of())
            .encryptedValues(encryptedValues.ciphertext())
            .encryptionAlgorithm(encryptedValues.algorithm())
            .encryptionKeyId(encryptedValues.keyId())
            .encryptedAt(encryptedValues.encryptedAt())
            .context(context)
            .status(DocumentWorkflowStatus.DRAFT)
            .idempotencyScope(scope)
            .requestFingerprint(fingerprint)
            .createdByUserId(CurrentUser.id())
            .build();
    GeneratedDocument saved;
    try {
      saved = generatedRepository.save(generated);
    } catch (DuplicateKeyException race) {
      storage.deleteObject(minioConfig.getGeneratedBucket(), objectName);
      if (scope != null) {
        GeneratedDocument winner =
            generatedRepository.findByIdempotencyScope(scope).orElseThrow(() -> race);
        return idempotentResult(winner, fingerprint);
      }
      throw race;
    } catch (RuntimeException e) {
      storage.deleteObject(minioConfig.getGeneratedBucket(), objectName);
      throw e;
    }
    auditService.record(
        DocumentAuditService.GENERATED_DOCUMENT,
        saved.getId(),
        "DOCUMENT_GENERATED",
        null,
        DocumentWorkflowStatus.DRAFT.name(),
        auditMetadata(saved));
    return toResponse(saved);
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public List<GeneratedDocumentResponse> listGenerated() {
    return pageGenerated(
            null, null, null, null, null, null, false, 0, LEGACY_LIST_LIMIT, "createdAt", "desc")
        .content();
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public GeneratedDocumentResponse restoreFromRetention(String id) {
    GeneratedDocument document =
        generatedRepository
            .findById(id)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài liệu"));
    document.setHiddenByRetention(false);
    document.setRetentionHiddenAt(null);
    GeneratedDocument saved = generatedRepository.save(document);
    auditService.record(
        DocumentAuditService.GENERATED_DOCUMENT, id, "RETENTION_RESTORED", null, null, null);
    return toResponse(saved);
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public PageResponse<GeneratedDocumentResponse> pageGenerated(
      String query,
      String status,
      String crmCaseId,
      String customerId,
      String serviceId,
      String templateId,
      boolean includeExpired,
      int page,
      int size,
      String sort,
      String direction) {
    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), 100);
    String sortField = GENERATED_SORT_FIELDS.contains(sort) ? sort : "createdAt";
    Sort.Direction sortDirection =
        "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
    Criteria criteria =
        generatedCriteria(
            query, status, crmCaseId, customerId, serviceId, templateId, includeExpired);
    long total = mongoTemplate.count(Query.query(criteria), GeneratedDocument.class);
    List<GeneratedDocumentResponse> content =
        mongoTemplate
            .find(
                Query.query(criteria)
                    .with(PageRequest.of(safePage, safeSize, Sort.by(sortDirection, sortField))),
                GeneratedDocument.class)
            .stream()
            .map(this::toResponse)
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
  public GeneratedDocumentResponse get(String id) {
    return toResponse(findAuthorized(id));
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public GeneratedDocumentResponse transition(String id, WorkflowTransitionRequest request) {
    GeneratedDocument document = prepareGenerated(findAuthorized(id));
    if (request.expectedRevision() != null
        && !request.expectedRevision().equals(document.getRevision())) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Tài liệu đã được cập nhật; vui lòng tải lại");
    }
    DocumentWorkflowStatus from = document.getStatus();
    DocumentWorkflowStatus target = request.targetStatus();
    if (from == target) return toResponse(document);
    authorizeTransition(document, from, target, request);
    applyTransition(document, target, request);
    try {
      GeneratedDocument saved = generatedRepository.save(document);
      Map<String, String> metadata = auditMetadata(saved);
      if (request.reason() != null && !request.reason().isBlank()) {
        // The free-text reason can contain privileged legal/PII content; audit only its presence.
        metadata.put("reasonProvided", "true");
      }
      auditService.record(
          DocumentAuditService.GENERATED_DOCUMENT,
          saved.getId(),
          "WORKFLOW_TRANSITION",
          from.name(),
          target.name(),
          metadata);
      return toResponse(saved);
    } catch (org.springframework.dao.OptimisticLockingFailureException e) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Tài liệu đã được cập nhật đồng thời; vui lòng tải lại");
    }
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public DownloadFile download(String id) {
    GeneratedDocument document = findAuthorized(id);
    java.io.InputStream stream =
        storage.getObject(document.getGeneratedBucket(), document.getGeneratedObjectName());
    auditService.record(
        DocumentAuditService.GENERATED_DOCUMENT,
        document.getId(),
        "DOCUMENT_DOWNLOADED",
        effectiveStatus(document).name(),
        effectiveStatus(document).name(),
        auditMetadata(document));
    return new DownloadFile(
        document.getGeneratedFileName(), DocxTemplateEngine.DOCX_CONTENT_TYPE, stream);
  }

  private GeneratedDocument findAuthorized(String id) {
    GeneratedDocument document =
        generatedRepository
            .findById(id)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy tài liệu đã tạo"));
    if (!canAccess(document)) {
      auditService.record(
          DocumentAuditService.GENERATED_DOCUMENT,
          document.getId(),
          "ACCESS_DENIED",
          effectiveStatus(document).name(),
          effectiveStatus(document).name(),
          Map.of("requestedAction", "READ_OR_DOWNLOAD"));
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN, "Không có quyền truy cập tài liệu này");
    }
    return document;
  }

  private boolean canAccess(GeneratedDocument document) {
    return CurrentUser.isAdmin()
        || CurrentUser.id().equals(document.getCreatedByUserId())
        || CurrentUser.id().equals(document.getReviewerUserId());
  }

  private GeneratedDocument prepareGenerated(GeneratedDocument document) {
    if (document.getRevision() != null) {
      if (document.getStatus() == null) document.setStatus(DocumentWorkflowStatus.DRAFT);
      return document;
    }
    mongoTemplate.updateFirst(
        Query.query(Criteria.where("_id").is(document.getId()).and("revision").exists(false)),
        Update.update("revision", 0L),
        GeneratedDocument.class);
    GeneratedDocument migrated = generatedRepository.findById(document.getId()).orElse(document);
    if (migrated.getStatus() == null) migrated.setStatus(DocumentWorkflowStatus.DRAFT);
    return migrated;
  }

  private Criteria generatedCriteria(
      String query,
      String status,
      String crmCaseId,
      String customerId,
      String serviceId,
      String templateId,
      boolean includeExpired) {
    List<Criteria> all = new ArrayList<>();
    // Mặc định ẩn tài liệu đã quá hạn lưu trữ; chỉ admin và khi yêu cầu mới thấy.
    if (!includeExpired || !CurrentUser.isAdmin()) {
      all.add(Criteria.where("hiddenByRetention").ne(true));
    }
    if (!CurrentUser.isAdmin()) {
      all.add(
          new Criteria()
              .orOperator(
                  Criteria.where("createdByUserId").is(CurrentUser.id()),
                  Criteria.where("reviewerUserId").is(CurrentUser.id())));
    }
    if (status != null && !status.isBlank()) {
      all.add(Criteria.where("status").is(parseWorkflowStatus(status)));
    }
    if (crmCaseId != null && !crmCaseId.isBlank()) {
      all.add(Criteria.where("context.crmCaseId").is(crmCaseId.trim()));
    }
    if (customerId != null && !customerId.isBlank()) {
      all.add(Criteria.where("context.customerId").is(customerId.trim()));
    }
    if (serviceId != null && !serviceId.isBlank()) {
      all.add(Criteria.where("context.serviceId").is(serviceId.trim()));
    }
    if (templateId != null && !templateId.isBlank()) {
      all.add(Criteria.where("templateId").is(templateId.trim()));
    }
    if (query != null && !query.isBlank()) {
      Pattern pattern = Pattern.compile(Pattern.quote(query.trim()), Pattern.CASE_INSENSITIVE);
      all.add(
          new Criteria()
              .orOperator(
                  Criteria.where("generatedFileName").regex(pattern),
                  Criteria.where("templateNameSnapshot").regex(pattern),
                  Criteria.where("context.crmCaseId").regex(pattern),
                  Criteria.where("context.dossierId").regex(pattern),
                  Criteria.where("context.matterReference").regex(pattern),
                  Criteria.where("context.serviceName").regex(pattern)));
    }
    return all.isEmpty() ? new Criteria() : new Criteria().andOperator(all);
  }

  private void authorizeTransition(
      GeneratedDocument document,
      DocumentWorkflowStatus from,
      DocumentWorkflowStatus target,
      WorkflowTransitionRequest request) {
    boolean admin = CurrentUser.isAdmin();
    boolean owner = CurrentUser.id().equals(document.getCreatedByUserId());
    boolean reviewer = CurrentUser.id().equals(document.getReviewerUserId());
    boolean allowed =
        switch (target) {
          case IN_REVIEW ->
              ((from == DocumentWorkflowStatus.DRAFT || from == DocumentWorkflowStatus.REJECTED)
                      && (owner || admin))
                  || (from == DocumentWorkflowStatus.APPROVED && admin);
          case APPROVED, REJECTED ->
              from == DocumentWorkflowStatus.IN_REVIEW && (reviewer || admin);
          case FINAL -> from == DocumentWorkflowStatus.APPROVED && admin;
          case VOID ->
              from != DocumentWorkflowStatus.FINAL && from != DocumentWorkflowStatus.VOID && admin;
          case DRAFT -> false;
        };
    if (!allowed) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Chuyển trạng thái không hợp lệ hoặc không đủ quyền");
    }
    if (target == DocumentWorkflowStatus.IN_REVIEW
        && (request.reviewerUserId() == null || request.reviewerUserId().isBlank())
        && (document.getReviewerUserId() == null || document.getReviewerUserId().isBlank())) {
      throw badRequest("Phải chỉ định người duyệt");
    }
    if ((target == DocumentWorkflowStatus.REJECTED || target == DocumentWorkflowStatus.VOID)
        && (request.reason() == null || request.reason().isBlank())) {
      throw badRequest("Phải nhập lý do");
    }
  }

  private void applyTransition(
      GeneratedDocument document,
      DocumentWorkflowStatus target,
      WorkflowTransitionRequest request) {
    Instant now = Instant.now();
    switch (target) {
      case IN_REVIEW -> {
        if (request.reviewerUserId() != null && !request.reviewerUserId().isBlank()) {
          document.setReviewerUserId(request.reviewerUserId().trim());
        }
        document.setSubmittedAt(now);
        document.setRejectionReason(null);
        clearEncryptedWorkflowReason(document);
        document.setApprovedByUserId(null);
        document.setApprovedAt(null);
      }
      case APPROVED -> {
        document.setApprovedByUserId(CurrentUser.id());
        document.setApprovedAt(now);
        document.setRejectionReason(null);
      }
      case REJECTED -> {
        setEncryptedWorkflowReason(document, request.reason().trim());
        document.setApprovedByUserId(null);
        document.setApprovedAt(null);
      }
      case FINAL -> {
        document.setFinalizedByUserId(CurrentUser.id());
        document.setFinalizedAt(now);
      }
      case VOID -> {
        document.setVoidedByUserId(CurrentUser.id());
        document.setVoidedAt(now);
        setEncryptedWorkflowReason(document, request.reason().trim());
      }
      case DRAFT -> throw new IllegalStateException("DRAFT is not a transition target");
    }
    document.setStatus(target);
  }

  private void setEncryptedWorkflowReason(GeneratedDocument document, String reason) {
    SensitiveValueEncryptionService.EncryptedValues encrypted =
        encryptionService.encryptWorkflowReason(reason, document.getId());
    document.setRejectionReason(null);
    document.setEncryptedWorkflowReason(encrypted.ciphertext());
    document.setWorkflowReasonEncryptionAlgorithm(encrypted.algorithm());
    document.setWorkflowReasonEncryptionKeyId(encrypted.keyId());
    document.setWorkflowReasonEncryptedAt(encrypted.encryptedAt());
  }

  private void clearEncryptedWorkflowReason(GeneratedDocument document) {
    document.setEncryptedWorkflowReason(null);
    document.setWorkflowReasonEncryptionAlgorithm(null);
    document.setWorkflowReasonEncryptionKeyId(null);
    document.setWorkflowReasonEncryptedAt(null);
  }

  private LegalDocumentContext normalizeContext(
      LegalContextRequest request, DocumentTemplateVersion version) {
    Map<String, String> references = new LinkedHashMap<>();
    if (request != null && request.sourceReferences() != null) {
      request.sourceReferences().entrySet().stream()
          .sorted(Map.Entry.comparingByKey())
          .limit(50)
          .forEach(
              entry -> {
                if (entry.getKey() != null
                    && !entry.getKey().isBlank()
                    && entry.getValue() != null
                    && !entry.getValue().isBlank()) {
                  references.put(
                      truncate(entry.getKey().trim(), 100), truncate(entry.getValue().trim(), 500));
                }
              });
    }
    return LegalDocumentContext.builder()
        .crmCaseId(clean(request == null ? null : request.crmCaseId(), 100))
        .customerId(clean(request == null ? null : request.customerId(), 100))
        .serviceId(
            clean(
                request == null || request.serviceId() == null
                    ? version.getServiceId()
                    : request.serviceId(),
                100))
        .serviceName(
            clean(
                request == null || request.serviceName() == null
                    ? version.getServiceName()
                    : request.serviceName(),
                200))
        .dossierId(clean(request == null ? null : request.dossierId(), 100))
        .matterReference(clean(request == null ? null : request.matterReference(), 100))
        .sourceReferences(references)
        .build();
  }

  private String idempotencyScope(String key) {
    if (key == null || key.isBlank()) return null;
    String trimmed = key.trim();
    if (trimmed.length() > 200 || trimmed.chars().anyMatch(Character::isISOControl)) {
      throw badRequest("Idempotency-Key không hợp lệ");
    }
    String digest = DocumentHashing.sha256(trimmed.getBytes(StandardCharsets.UTF_8));
    return CurrentUser.id() + ":" + digest;
  }

  private String fingerprint(
      DocumentTemplateVersion version, Map<String, String> values, LegalDocumentContext context) {
    StringBuilder canonical = new StringBuilder(version.getId()).append('\n');
    new TreeMap<>(values)
        .forEach((key, value) -> canonical.append(key).append('=').append(value).append('\n'));
    canonical
        .append(nullToEmpty(context.getCrmCaseId()))
        .append('\n')
        .append(nullToEmpty(context.getCustomerId()))
        .append('\n')
        .append(nullToEmpty(context.getServiceId()))
        .append('\n')
        .append(nullToEmpty(context.getServiceName()))
        .append('\n')
        .append(nullToEmpty(context.getDossierId()))
        .append('\n')
        .append(nullToEmpty(context.getMatterReference()))
        .append('\n');
    new TreeMap<>(context.getSourceReferences())
        .forEach((key, value) -> canonical.append(key).append('=').append(value).append('\n'));
    return DocumentHashing.sha256(canonical.toString().getBytes(StandardCharsets.UTF_8));
  }

  private GeneratedDocumentResponse idempotentResult(
      GeneratedDocument existing, String fingerprint) {
    if (!fingerprint.equals(existing.getRequestFingerprint())) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Idempotency-Key đã được dùng cho yêu cầu khác");
    }
    return toResponse(existing);
  }

  private String buildGeneratedFileName(DocumentTemplateVersion version) {
    String base = safeFileName(version.getName());
    String timestamp =
        DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")
            .withZone(java.time.ZoneId.of("Asia/Ho_Chi_Minh"))
            .format(Instant.now());
    return base + "_v" + version.getVersionNumber() + "_" + timestamp + ".docx";
  }

  private String safeFileName(String name) {
    String normalized =
        Normalizer.normalize(name == null ? "document" : name, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "");
    String safe = normalized.replaceAll("[^a-zA-Z0-9._-]", "_").replaceAll("_+", "_");
    return safe.isBlank() ? "document" : safe;
  }

  private Map<String, String> auditMetadata(GeneratedDocument document) {
    Map<String, String> metadata = new LinkedHashMap<>();
    metadata.put("templateId", document.getTemplateId());
    metadata.put("templateVersionId", document.getTemplateVersionId());
    putIfPresent(metadata, "generatedSha256", document.getGeneratedContentSha256());
    LegalDocumentContext context =
        document.getContext() == null ? new LegalDocumentContext() : document.getContext();
    putIfPresent(metadata, "crmCaseId", context.getCrmCaseId());
    putIfPresent(metadata, "customerId", context.getCustomerId());
    putIfPresent(metadata, "serviceId", context.getServiceId());
    putIfPresent(metadata, "reviewerUserId", document.getReviewerUserId());
    return metadata;
  }

  private void putIfPresent(Map<String, String> target, String key, String value) {
    if (value != null && !value.isBlank()) target.put(key, value);
  }

  /* ===== Trường lặp (list) ===== */

  private static Map<String, List<Map<String, String>>> safeLists(
      Map<String, List<Map<String, String>>> lists) {
    return lists == null ? Map.of() : lists;
  }

  /** Chặn dữ liệu trường lặp quá lớn (tổng độ dài giá trị). */
  private void guardListSize(Map<String, List<Map<String, String>>> lists) {
    long total = 0;
    for (List<Map<String, String>> rows : lists.values()) {
      if (rows == null) continue;
      for (Map<String, String> row : rows) {
        if (row == null) continue;
        for (String v : row.values()) if (v != null) total += v.length();
      }
    }
    if (total > 1_000_000) throw badRequest("Dữ liệu trường lặp quá lớn");
  }

  /** Phẳng hóa list thành key {@code listKey[i].child} để lưu/mã hóa/fingerprint cùng scalar. */
  private static Map<String, String> flattenWithLists(
      Map<String, String> scalar, Map<String, List<Map<String, String>>> lists) {
    Map<String, String> out = new java.util.LinkedHashMap<>(scalar);
    lists.forEach(
        (listKey, rows) -> {
          if (rows == null) return;
          for (int i = 0; i < rows.size(); i++) {
            Map<String, String> row = rows.get(i);
            if (row == null) continue;
            int idx = i;
            row.forEach(
                (child, value) ->
                    out.put(listKey + "[" + idx + "]." + child, value == null ? "" : value));
          }
        });
    return out;
  }

  private DocumentWorkflowStatus effectiveStatus(GeneratedDocument document) {
    return document.getStatus() == null ? DocumentWorkflowStatus.DRAFT : document.getStatus();
  }

  private GeneratedDocumentResponse toResponse(GeneratedDocument document) {
    LegalDocumentContext context =
        document.getContext() == null ? new LegalDocumentContext() : document.getContext();
    return new GeneratedDocumentResponse(
        document.getId(),
        document.getTemplateId(),
        document.getTemplateVersionId(),
        document.getTemplateNameSnapshot(),
        document.getTemplateVersionSnapshot(),
        document.getTemplateContentSha256(),
        document.getGeneratedContentSha256(),
        document.getGeneratedFileName(),
        "/documents/generated/" + document.getId() + "/download",
        new LegalContextResponse(
            context.getCrmCaseId(),
            context.getCustomerId(),
            context.getServiceId(),
            context.getServiceName(),
            context.getDossierId(),
            context.getMatterReference(),
            context.getSourceReferences() == null ? Map.of() : context.getSourceReferences()),
        document.getStatus() == null ? DocumentWorkflowStatus.DRAFT : document.getStatus(),
        document.getReviewerUserId(),
        document.getApprovedByUserId(),
        document.getFinalizedByUserId(),
        encryptionService.decryptWorkflowReason(document),
        document.getCreatedByUserId(),
        document.getSubmittedAt(),
        document.getApprovedAt(),
        document.getFinalizedAt(),
        document.getCreatedAt(),
        document.getUpdatedAt(),
        document.getRevision(),
        document.isHiddenByRetention());
  }

  private DocumentWorkflowStatus parseWorkflowStatus(String status) {
    try {
      return DocumentWorkflowStatus.valueOf(status.trim().toUpperCase());
    } catch (IllegalArgumentException e) {
      throw badRequest("Trạng thái tài liệu không hợp lệ");
    }
  }

  private String clean(String value, int maxLength) {
    if (value == null || value.isBlank()) return null;
    return truncate(value.trim(), maxLength);
  }

  private String truncate(String value, int maxLength) {
    return value.length() <= maxLength ? value : value.substring(0, maxLength);
  }

  private String nullToEmpty(String value) {
    return value == null ? "" : value;
  }

  private ResponseStatusException badRequest(String reason) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, reason);
  }
}
