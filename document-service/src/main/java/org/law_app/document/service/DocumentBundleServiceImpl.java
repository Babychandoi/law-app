package org.law_app.document.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.law_app.document.domain.DocumentBundle;
import org.law_app.document.domain.DocumentBundle.BundleItem;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.law_app.document.repository.DocumentBundleRepository;
import org.law_app.document.repository.DocumentTemplateRepository;
import org.law_app.document.web.CurrentUser;
import org.law_app.document.web.Dtos.BundleGenerationResult;
import org.law_app.document.web.Dtos.BundleItemResponse;
import org.law_app.document.web.Dtos.DocumentBundleRequest;
import org.law_app.document.web.Dtos.DocumentBundleResponse;
import org.law_app.document.web.Dtos.GenerateBundleItemRequest;
import org.law_app.document.web.Dtos.GenerateBundleRequest;
import org.law_app.document.web.Dtos.GenerateBundleResponse;
import org.law_app.document.web.Dtos.GenerateDocumentRequest;
import org.law_app.document.web.Dtos.GeneratedDocumentResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class DocumentBundleServiceImpl implements DocumentBundleService {

  private final DocumentBundleRepository bundleRepository;
  private final DocumentTemplateRepository templateRepository;
  private final GeneratedDocumentService generatedDocumentService;
  private final DocumentAuditService auditService;

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentBundleResponse create(DocumentBundleRequest request) {
    List<BundleItem> items = toItems(request);
    DocumentBundle bundle =
        DocumentBundle.builder()
            .id(UUID.randomUUID().toString())
            .name(request.name().trim())
            .description(blankToNull(request.description()))
            .status(DocumentTemplateStatus.ACTIVE)
            .serviceId(blankToNull(request.serviceId()))
            .serviceName(blankToNull(request.serviceName()))
            .tags(request.tags() == null ? List.of() : List.copyOf(request.tags()))
            .items(items)
            .createdByUserId(CurrentUser.id())
            .updatedByUserId(CurrentUser.id())
            .build();
    DocumentBundle saved = bundleRepository.save(bundle);
    auditService.record("BUNDLE", saved.getId(), "BUNDLE_CREATED", null, "ACTIVE", null);
    return toResponse(saved);
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentBundleResponse update(String id, DocumentBundleRequest request) {
    DocumentBundle bundle = find(id);
    assertRevision(bundle, request.expectedRevision());
    bundle.setName(request.name().trim());
    bundle.setDescription(blankToNull(request.description()));
    bundle.setServiceId(blankToNull(request.serviceId()));
    bundle.setServiceName(blankToNull(request.serviceName()));
    bundle.setTags(request.tags() == null ? List.of() : List.copyOf(request.tags()));
    bundle.setItems(toItems(request));
    bundle.setUpdatedByUserId(CurrentUser.id());
    DocumentBundle saved = bundleRepository.save(bundle);
    auditService.record("BUNDLE", saved.getId(), "BUNDLE_UPDATED", null, null, null);
    return toResponse(saved);
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public List<DocumentBundleResponse> list() {
    List<DocumentBundle> bundles =
        CurrentUser.isAdmin()
            ? bundleRepository.findAllByOrderByUpdatedAtDesc()
            : bundleRepository.findByStatusOrderByUpdatedAtDesc(DocumentTemplateStatus.ACTIVE);
    return bundles.stream().map(this::toResponse).toList();
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public DocumentBundleResponse get(String id) {
    DocumentBundle bundle = find(id);
    if (!CurrentUser.isAdmin() && bundle.getStatus() != DocumentTemplateStatus.ACTIVE) {
      throw notFound();
    }
    return toResponse(bundle);
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public DocumentBundleResponse archive(String id) {
    DocumentBundle bundle = find(id);
    bundle.setStatus(DocumentTemplateStatus.ARCHIVED);
    bundle.setUpdatedByUserId(CurrentUser.id());
    DocumentBundle saved = bundleRepository.save(bundle);
    auditService.record("BUNDLE", saved.getId(), "BUNDLE_ARCHIVED", null, "ARCHIVED", null);
    return toResponse(saved);
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public GenerateBundleResponse generate(
      String id, GenerateBundleRequest request, String idempotencyKey) {
    DocumentBundle bundle = find(id);
    if (bundle.getStatus() != DocumentTemplateStatus.ACTIVE) {
      throw badRequest("Bộ mẫu chưa được kích hoạt");
    }
    Map<String, String> shared = request.sharedValues() == null ? Map.of() : request.sharedValues();
    Map<String, GenerateBundleItemRequest> overrides = new LinkedHashMap<>();
    if (request.items() != null) {
      request.items().forEach(item -> overrides.put(item.templateId(), item));
    }

    List<BundleItem> ordered =
        bundle.getItems().stream()
            .sorted(Comparator.comparingInt(BundleItem::getSortOrder))
            .toList();
    List<BundleGenerationResult> results = new ArrayList<>();
    int succeeded = 0;
    int index = 0;
    for (BundleItem item : ordered) {
      GenerateBundleItemRequest override = overrides.get(item.getTemplateId());
      Map<String, String> values = new LinkedHashMap<>(shared);
      if (override != null && override.values() != null) values.putAll(override.values());
      GenerateDocumentRequest itemRequest =
          new GenerateDocumentRequest(
              values, override == null ? null : override.lists(), request.context());
      String itemKey = idempotencyKey == null ? null : idempotencyKey + ":" + index;
      try {
        GeneratedDocumentResponse document =
            generatedDocumentService.generate(item.getTemplateId(), itemRequest, itemKey);
        results.add(new BundleGenerationResult(item.getTemplateId(), document, null));
        succeeded++;
      } catch (ResponseStatusException e) {
        // Mẫu không bắt buộc lỗi -> ghi nhận và tiếp tục; mẫu bắt buộc lỗi -> vẫn tiếp tục nhưng
        // báo rõ để người dùng xử lý cả bộ.
        results.add(new BundleGenerationResult(item.getTemplateId(), null, e.getReason()));
      }
      index++;
    }
    auditService.record(
        "BUNDLE",
        id,
        "BUNDLE_GENERATED",
        null,
        null,
        Map.of("total", String.valueOf(ordered.size()), "succeeded", String.valueOf(succeeded)));
    return new GenerateBundleResponse(
        id, ordered.size(), succeeded, ordered.size() - succeeded, results);
  }

  private List<BundleItem> toItems(DocumentBundleRequest request) {
    List<BundleItem> items = new ArrayList<>();
    int order = 0;
    for (var itemRequest : request.items()) {
      if (!templateRepository.existsById(itemRequest.templateId())) {
        throw badRequest("Mẫu không tồn tại: " + itemRequest.templateId());
      }
      items.add(
          BundleItem.builder()
              .templateId(itemRequest.templateId())
              .sortOrder(itemRequest.sortOrder() == 0 ? order : itemRequest.sortOrder())
              .required(itemRequest.required())
              .build());
      order++;
    }
    return items;
  }

  private DocumentBundleResponse toResponse(DocumentBundle bundle) {
    List<BundleItemResponse> items =
        bundle.getItems().stream()
            .sorted(Comparator.comparingInt(BundleItem::getSortOrder))
            .map(
                item ->
                    new BundleItemResponse(
                        item.getTemplateId(), item.getSortOrder(), item.isRequired()))
            .toList();
    return new DocumentBundleResponse(
        bundle.getId(),
        bundle.getName(),
        bundle.getDescription(),
        bundle.getStatus(),
        bundle.getServiceId(),
        bundle.getServiceName(),
        bundle.getTags(),
        items,
        bundle.getCreatedByUserId(),
        bundle.getUpdatedByUserId(),
        bundle.getCreatedAt(),
        bundle.getUpdatedAt(),
        bundle.getRevision());
  }

  private DocumentBundle find(String id) {
    return bundleRepository.findById(id).orElseThrow(this::notFound);
  }

  private void assertRevision(DocumentBundle bundle, Long expected) {
    if (expected != null
        && bundle.getRevision() != null
        && !expected.equals(bundle.getRevision())) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Bộ mẫu đã được cập nhật ở nơi khác, hãy tải lại");
    }
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }

  private ResponseStatusException badRequest(String message) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
  }

  private ResponseStatusException notFound() {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ mẫu");
  }
}
