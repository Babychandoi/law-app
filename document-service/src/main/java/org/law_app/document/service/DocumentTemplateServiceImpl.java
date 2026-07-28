package org.law_app.document.service;

import java.io.IOException;
import java.io.InputStream;
import java.text.Normalizer;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.law_app.document.config.MinioConfig;
import org.law_app.document.domain.DocumentFieldInputType;
import org.law_app.document.domain.DocumentTemplate;
import org.law_app.document.domain.DocumentTemplateField;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.law_app.document.repository.DocumentTemplateRepository;
import org.law_app.document.web.CurrentUser;
import org.law_app.document.web.Dtos.DocumentTemplateResponse;
import org.law_app.document.web.Dtos.TemplateFieldRequest;
import org.law_app.document.web.Dtos.TemplateFieldResponse;
import org.law_app.document.web.Dtos.UpdateFieldsRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class DocumentTemplateServiceImpl implements DocumentTemplateService {

  private static final long MAX_TEMPLATE_SIZE = 25L * 1024 * 1024;

  private final DocumentTemplateRepository repository;
  private final MinioConfig minioConfig;
  private final MinioDocumentStorageService storage;
  private final DocxTemplateEngine docxTemplateEngine;

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentTemplateResponse uploadTemplate(
      MultipartFile file, String name, String description) {
    validateTemplateUpload(file, name);
    Set<String> keys;
    try {
      keys = docxTemplateEngine.extractPlaceholders(file.getInputStream());
    } catch (Exception e) {
      if (e instanceof ResponseStatusException statusException) throw statusException;
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không đọc được file Word mẫu");
    }
    if (keys.isEmpty()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "File mẫu chưa có placeholder ${key}");
    }

    String id = UUID.randomUUID().toString();
    String original = safeOriginalName(file.getOriginalFilename());
    String objectName =
        "templates/" + id + "/v1/" + UUID.randomUUID() + "_" + safeFileName(original);
    storage.uploadMultipart(minioConfig.getTemplatesBucket(), objectName, file);

    List<DocumentTemplateField> fields =
        keys.stream()
            .map(
                key ->
                    DocumentTemplateField.builder()
                        .fieldKey(key)
                        .label("")
                        .inputType(DocumentFieldInputType.TEXT)
                        .required(true)
                        .sortOrder(keys.stream().toList().indexOf(key) + 1)
                        .build())
            .toList();

    DocumentTemplate template =
        DocumentTemplate.builder()
            .id(id)
            .name(name.trim())
            .description(blankToNull(description))
            .status(DocumentTemplateStatus.DRAFT)
            .version(1)
            .originalFileName(original)
            .templateObjectName(objectName)
            .templateBucket(minioConfig.getTemplatesBucket())
            .contentType(DocxTemplateEngine.DOCX_CONTENT_TYPE)
            .fileSize(file.getSize())
            .fields(fields)
            .createdByUserId(CurrentUser.id())
            .build();
    return toResponse(repository.save(template));
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public org.law_app.document.web.Dtos.TemplatePreviewResponse uploadRaw(
      MultipartFile file, String name, String description) {
    validateTemplateUpload(file, name);
    // Verify it is a loadable Word doc and build the HTML preview.
    String html;
    try {
      html = docxTemplateEngine.toHtml(file.getInputStream());
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không đọc được file Word mẫu");
    }

    String id = UUID.randomUUID().toString();
    String original = safeOriginalName(file.getOriginalFilename());
    String objectName =
        "templates/" + id + "/v1/" + UUID.randomUUID() + "_" + safeFileName(original);
    storage.uploadMultipart(minioConfig.getTemplatesBucket(), objectName, file);

    DocumentTemplate template =
        DocumentTemplate.builder()
            .id(id)
            .name(name.trim())
            .description(blankToNull(description))
            .status(DocumentTemplateStatus.DRAFT)
            .version(1)
            .originalFileName(original)
            .templateObjectName(objectName)
            .templateBucket(minioConfig.getTemplatesBucket())
            .contentType(DocxTemplateEngine.DOCX_CONTENT_TYPE)
            .fileSize(file.getSize())
            .createdByUserId(CurrentUser.id())
            .build();
    DocumentTemplate saved = repository.save(template);
    return new org.law_app.document.web.Dtos.TemplatePreviewResponse(
        saved.getId(), saved.getName(), html);
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public org.law_app.document.web.Dtos.TemplatePreviewResponse preview(String id) {
    DocumentTemplate template = findTemplate(id);
    String html =
        docxTemplateEngine.toHtml(
            storage.getObject(template.getTemplateBucket(), template.getTemplateObjectName()));
    return new org.law_app.document.web.Dtos.TemplatePreviewResponse(
        template.getId(), template.getName(), html);
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentTemplateResponse applyMappings(
      String id, org.law_app.document.web.Dtos.ApplyMappingsRequest request) {
    DocumentTemplate template = findTemplate(id);

    java.util.LinkedHashMap<String, String> textToKey = new java.util.LinkedHashMap<>();
    Set<String> seenKeys = new LinkedHashSet<>();
    for (var m : request.mappings()) {
      if (!m.fieldKey().matches("[A-Za-z][A-Za-z0-9_]{0,63}")) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Key không hợp lệ: " + m.fieldKey());
      }
      if (!seenKeys.add(m.fieldKey())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Key bị trùng: " + m.fieldKey());
      }
      textToKey.put(m.sampleText(), m.fieldKey());
    }

    byte[] updated =
        docxTemplateEngine.applyMappings(
            storage.getObject(template.getTemplateBucket(), template.getTemplateObjectName()),
            textToKey);

    // Overwrite the stored .docx with the placeholder version (same object name keeps it simple).
    storage.uploadBytes(
        template.getTemplateBucket(),
        template.getTemplateObjectName(),
        updated,
        DocxTemplateEngine.DOCX_CONTENT_TYPE);
    template.setFileSize(updated.length);

    List<DocumentTemplateField> fields =
        request.mappings().stream()
            .map(
                m ->
                    DocumentTemplateField.builder()
                        .fieldKey(m.fieldKey())
                        .label(m.label().trim())
                        .helpText(blankToNull(m.helpText()))
                        .inputType(m.inputType())
                        .required(m.required())
                        .sortOrder(m.sortOrder())
                        .defaultValue(m.defaultValue())
                        .build())
            .sorted(Comparator.comparingInt(DocumentTemplateField::getSortOrder))
            .toList();
    template.setFields(fields);
    return toResponse(repository.save(template));
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public List<DocumentTemplateResponse> listTemplates(String status) {
    if (CurrentUser.isAdmin() && status != null && !status.isBlank()) {
      if ("ALL".equalsIgnoreCase(status)) {
        return repository.findAllByOrderByUpdatedAtDesc().stream().map(this::toResponse).toList();
      }
      DocumentTemplateStatus requestedStatus;
      try {
        requestedStatus = DocumentTemplateStatus.valueOf(status.toUpperCase());
      } catch (IllegalArgumentException e) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái mẫu không hợp lệ");
      }
      return repository.findByStatusOrderByUpdatedAtDesc(requestedStatus).stream()
          .map(this::toResponse)
          .toList();
    }
    return repository.findByStatusOrderByUpdatedAtDesc(DocumentTemplateStatus.ACTIVE).stream()
        .map(this::toResponse)
        .toList();
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public DocumentTemplateResponse getTemplate(String id) {
    DocumentTemplate template = findTemplate(id);
    if (!CurrentUser.isAdmin() && template.getStatus() != DocumentTemplateStatus.ACTIVE) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy mẫu tài liệu");
    }
    return toResponse(template);
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentTemplateResponse updateFields(String id, UpdateFieldsRequest request) {
    DocumentTemplate template = findTemplate(id);
    Set<String> existingKeys =
        template.getFields().stream()
            .map(DocumentTemplateField::getFieldKey)
            .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
    Set<String> submittedKeys = new LinkedHashSet<>();
    for (TemplateFieldRequest field : request.fields()) {
      if (!existingKeys.contains(field.fieldKey())) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Key không tồn tại trong mẫu: " + field.fieldKey());
      }
      if (!submittedKeys.add(field.fieldKey())) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Key bị trùng: " + field.fieldKey());
      }
    }
    if (!submittedKeys.equals(existingKeys)) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Danh sách key phải khớp với file mẫu");
    }
    template.setFields(
        request.fields().stream()
            .map(
                f ->
                    DocumentTemplateField.builder()
                        .fieldKey(f.fieldKey())
                        .label(f.label().trim())
                        .helpText(blankToNull(f.helpText()))
                        .inputType(f.inputType())
                        .required(f.required())
                        .sortOrder(f.sortOrder())
                        .defaultValue(f.defaultValue())
                        .build())
            .sorted(Comparator.comparingInt(DocumentTemplateField::getSortOrder))
            .toList());
    return toResponse(repository.save(template));
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentTemplateResponse publish(String id) {
    DocumentTemplate template = findTemplate(id);
    boolean missingLabel =
        template.getFields().stream().anyMatch(f -> f.getLabel() == null || f.getLabel().isBlank());
    if (missingLabel) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Tất cả key phải có label trước khi publish");
    }
    template.setStatus(DocumentTemplateStatus.ACTIVE);
    return toResponse(repository.save(template));
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentTemplateResponse archive(String id) {
    DocumentTemplate template = findTemplate(id);
    template.setStatus(DocumentTemplateStatus.ARCHIVED);
    return toResponse(repository.save(template));
  }

  DocumentTemplate findTemplate(String id) {
    return repository
        .findById(id)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy mẫu tài liệu"));
  }

  DocumentTemplateResponse toResponse(DocumentTemplate template) {
    List<TemplateFieldResponse> fields =
        template.getFields().stream()
            .sorted(Comparator.comparingInt(DocumentTemplateField::getSortOrder))
            .map(
                f ->
                    new TemplateFieldResponse(
                        f.getFieldKey(),
                        f.getLabel(),
                        f.getHelpText(),
                        f.getInputType(),
                        f.isRequired(),
                        f.getSortOrder(),
                        f.getDefaultValue()))
            .toList();
    return new DocumentTemplateResponse(
        template.getId(),
        template.getName(),
        template.getDescription(),
        template.getStatus(),
        template.getVersion(),
        template.getOriginalFileName(),
        template.getFileSize(),
        fields,
        template.getCreatedByUserId(),
        template.getCreatedAt(),
        template.getUpdatedAt());
  }

  private void validateTemplateUpload(MultipartFile file, String name) {
    if (name == null || name.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên mẫu là bắt buộc");
    }
    if (file == null || file.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File mẫu là bắt buộc");
    }
    String original =
        file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
    if (!original.endsWith(".docx")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ hỗ trợ file .docx");
    }
    String contentType = file.getContentType();
    if (contentType == null || !DocxTemplateEngine.DOCX_CONTENT_TYPE.equals(contentType)) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Content-Type file Word không hợp lệ");
    }
    if (file.getSize() > MAX_TEMPLATE_SIZE) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "File mẫu không được vượt quá 25MB");
    }
    assertZipMagic(file);
  }

  private void assertZipMagic(MultipartFile file) {
    try (InputStream input = file.getInputStream()) {
      byte[] magic = input.readNBytes(4);
      if (magic.length < 4 || magic[0] != 'P' || magic[1] != 'K') {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File .docx không hợp lệ");
      }
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không đọc được file Word mẫu");
    }
  }

  private String safeOriginalName(String name) {
    return name == null || name.isBlank() ? "template.docx" : name;
  }

  private String safeFileName(String name) {
    String normalized = Normalizer.normalize(name, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
    return normalized.replaceAll("[^a-zA-Z0-9._-]", "_");
  }

  private String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
