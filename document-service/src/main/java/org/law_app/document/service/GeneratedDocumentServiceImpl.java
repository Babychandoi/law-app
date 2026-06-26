package org.law_app.document.service;

import java.text.Normalizer;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.law_app.document.config.MinioConfig;
import org.law_app.document.domain.DocumentTemplate;
import org.law_app.document.domain.DocumentTemplateField;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.law_app.document.domain.GeneratedDocument;
import org.law_app.document.repository.DocumentTemplateRepository;
import org.law_app.document.repository.GeneratedDocumentRepository;
import org.law_app.document.web.CurrentUser;
import org.law_app.document.web.Dtos.GenerateDocumentRequest;
import org.law_app.document.web.Dtos.GeneratedDocumentResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class GeneratedDocumentServiceImpl implements GeneratedDocumentService {

  private final DocumentTemplateRepository templateRepository;
  private final GeneratedDocumentRepository generatedRepository;
  private final MinioDocumentStorageService storage;
  private final DocxTemplateEngine docxTemplateEngine;
  private final MinioConfig minioConfig;

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public GeneratedDocumentResponse generate(String templateId, GenerateDocumentRequest request) {
    DocumentTemplate template =
        templateRepository
            .findById(templateId)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy mẫu tài liệu"));
    if (template.getStatus() != DocumentTemplateStatus.ACTIVE) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mẫu tài liệu chưa được publish");
    }

    Map<String, String> values = normalizeAndValidateValues(template, request.values());
    byte[] rendered =
        docxTemplateEngine.render(
            storage.getObject(template.getTemplateBucket(), template.getTemplateObjectName()),
            values);

    String id = UUID.randomUUID().toString();
    String fileName = buildGeneratedFileName(template);
    String objectName = "generated/" + template.getId() + "/" + id + "/" + fileName;
    storage.uploadBytes(
        minioConfig.getGeneratedBucket(),
        objectName,
        rendered,
        DocxTemplateEngine.DOCX_CONTENT_TYPE);

    GeneratedDocument generated =
        GeneratedDocument.builder()
            .id(id)
            .templateId(template.getId())
            .templateNameSnapshot(template.getName())
            .templateVersionSnapshot(template.getVersion())
            .generatedFileName(fileName)
            .generatedObjectName(objectName)
            .generatedBucket(minioConfig.getGeneratedBucket())
            .values(values)
            .createdByUserId(CurrentUser.id())
            .build();
    return toResponse(generatedRepository.save(generated));
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public List<GeneratedDocumentResponse> listGenerated() {
    List<GeneratedDocument> docs =
        CurrentUser.isAdmin()
            ? generatedRepository.findAllByOrderByCreatedAtDesc()
            : generatedRepository.findByCreatedByUserIdOrderByCreatedAtDesc(CurrentUser.id());
    return docs.stream().map(this::toResponse).toList();
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public DownloadFile download(String id) {
    GeneratedDocument doc =
        generatedRepository
            .findById(id)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy tài liệu đã tạo"));
    if (!CurrentUser.isAdmin() && !CurrentUser.id().equals(doc.getCreatedByUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền tải tài liệu này");
    }
    return new DownloadFile(
        doc.getGeneratedFileName(),
        DocxTemplateEngine.DOCX_CONTENT_TYPE,
        storage.getObject(doc.getGeneratedBucket(), doc.getGeneratedObjectName()));
  }

  private Map<String, String> normalizeAndValidateValues(
      DocumentTemplate template, Map<String, String> input) {
    Map<String, String> values = input == null ? Map.of() : input;
    Set<String> knownKeys =
        template.getFields().stream()
            .map(DocumentTemplateField::getFieldKey)
            .collect(Collectors.toSet());
    for (String key : values.keySet()) {
      if (!knownKeys.contains(key)) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Key không tồn tại trong mẫu: " + key);
      }
    }

    Map<String, String> normalized = new LinkedHashMap<>();
    for (DocumentTemplateField field : template.getFields()) {
      String value = values.get(field.getFieldKey());
      if ((value == null || value.isBlank()) && field.getDefaultValue() != null) {
        value = field.getDefaultValue();
      }
      if (field.isRequired() && (value == null || value.isBlank())) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Thiếu giá trị cho: " + field.getLabel());
      }
      normalized.put(field.getFieldKey(), value == null ? "" : value);
    }
    return normalized;
  }

  private String buildGeneratedFileName(DocumentTemplate template) {
    String base = safeFileName(template.getName());
    String timestamp =
        DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")
            .withZone(java.time.ZoneId.of("Asia/Ho_Chi_Minh"))
            .format(Instant.now());
    return base + "_" + timestamp + ".docx";
  }

  private String safeFileName(String name) {
    String normalized =
        Normalizer.normalize(name == null ? "document" : name, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "");
    String safe = normalized.replaceAll("[^a-zA-Z0-9._-]", "_").replaceAll("_+", "_");
    return safe.isBlank() ? "document" : safe;
  }

  private GeneratedDocumentResponse toResponse(GeneratedDocument doc) {
    return new GeneratedDocumentResponse(
        doc.getId(),
        doc.getTemplateId(),
        doc.getTemplateNameSnapshot(),
        doc.getTemplateVersionSnapshot(),
        doc.getGeneratedFileName(),
        "/documents/generated/" + doc.getId() + "/download",
        doc.getCreatedByUserId(),
        doc.getCreatedAt());
  }
}
