package org.law_app.document.service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.law_app.document.domain.DocumentShareLink;
import org.law_app.document.domain.GeneratedDocument;
import org.law_app.document.repository.DocumentShareLinkRepository;
import org.law_app.document.repository.GeneratedDocumentRepository;
import org.law_app.document.web.CurrentUser;
import org.law_app.document.web.Dtos.CreateShareRequest;
import org.law_app.document.web.Dtos.ShareLinkResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class DocumentShareServiceImpl implements DocumentShareService {

  private static final SecureRandom RANDOM = new SecureRandom();
  private static final int DEFAULT_EXPIRY_HOURS = 72;

  private final DocumentShareLinkRepository shareRepository;
  private final GeneratedDocumentRepository generatedRepository;
  private final MinioDocumentStorageService storage;
  private final DocumentAuditService auditService;

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ShareLinkResponse create(String generatedDocumentId, CreateShareRequest request) {
    GeneratedDocument generated =
        generatedRepository
            .findById(generatedDocumentId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài liệu"));
    int hours =
        request != null && request.expiresInHours() != null
            ? request.expiresInHours()
            : DEFAULT_EXPIRY_HOURS;
    Integer maxDownloads = request == null ? null : request.maxDownloads();

    byte[] raw = new byte[32];
    RANDOM.nextBytes(raw);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);

    DocumentShareLink link =
        DocumentShareLink.builder()
            .id(UUID.randomUUID().toString())
            .tokenHash(hash(token))
            .generatedDocumentId(generated.getId())
            .expiresAt(Instant.now().plus(Duration.ofHours(hours)))
            .maxDownloads(maxDownloads)
            .createdByUserId(CurrentUser.id())
            .build();
    DocumentShareLink saved = shareRepository.save(link);
    auditService.record(
        "GENERATED_DOCUMENT", generated.getId(), "SHARE_LINK_CREATED", null, null, null);
    return toResponse(saved, token);
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public List<ShareLinkResponse> list(String generatedDocumentId) {
    return shareRepository
        .findByGeneratedDocumentIdOrderByCreatedAtDesc(generatedDocumentId)
        .stream()
        .map(link -> toResponse(link, null))
        .toList();
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ShareLinkResponse revoke(String shareId) {
    DocumentShareLink link =
        shareRepository
            .findById(shareId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy link"));
    link.setRevoked(true);
    DocumentShareLink saved = shareRepository.save(link);
    auditService.record(
        "GENERATED_DOCUMENT",
        link.getGeneratedDocumentId(),
        "SHARE_LINK_REVOKED",
        null,
        null,
        null);
    return toResponse(saved, null);
  }

  @Override
  public SharedFile resolve(String token) {
    DocumentShareLink link =
        shareRepository
            .findByTokenHash(hash(token))
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link không hợp lệ"));
    if (link.isRevoked()) {
      throw new ResponseStatusException(HttpStatus.GONE, "Link đã bị thu hồi");
    }
    if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(Instant.now())) {
      throw new ResponseStatusException(HttpStatus.GONE, "Link đã hết hạn");
    }
    if (link.getMaxDownloads() != null && link.getDownloadCount() >= link.getMaxDownloads()) {
      throw new ResponseStatusException(HttpStatus.GONE, "Link đã hết lượt tải");
    }
    GeneratedDocument generated =
        generatedRepository
            .findById(link.getGeneratedDocumentId())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài liệu"));
    link.setDownloadCount(link.getDownloadCount() + 1);
    shareRepository.save(link);
    InputStream stream =
        storage.getObject(generated.getGeneratedBucket(), generated.getGeneratedObjectName());
    return new SharedFile(
        generated.getGeneratedFileName(), DocxTemplateEngine.DOCX_CONTENT_TYPE, stream);
  }

  private ShareLinkResponse toResponse(DocumentShareLink link, String token) {
    boolean expired = link.getExpiresAt() != null && link.getExpiresAt().isBefore(Instant.now());
    boolean exhausted =
        link.getMaxDownloads() != null && link.getDownloadCount() >= link.getMaxDownloads();
    boolean active = !link.isRevoked() && !expired && !exhausted;
    return new ShareLinkResponse(
        link.getId(),
        token,
        token == null ? null : "/documents/shared/" + token,
        link.getExpiresAt(),
        link.getMaxDownloads(),
        link.getDownloadCount(),
        link.isRevoked(),
        active,
        link.getCreatedAt());
  }

  private static String hash(String token) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không tạo được link");
    }
  }
}
