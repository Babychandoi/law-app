package org.law_app.document.service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.law_app.document.domain.DocumentClause;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.law_app.document.repository.DocumentClauseRepository;
import org.law_app.document.web.CurrentUser;
import org.law_app.document.web.Dtos.ClauseRequest;
import org.law_app.document.web.Dtos.ClauseResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class DocumentClauseServiceImpl implements DocumentClauseService {

  private final DocumentClauseRepository repository;

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public ClauseResponse create(ClauseRequest request) {
    DocumentClause clause =
        DocumentClause.builder()
            .id(UUID.randomUUID().toString())
            .title(request.title().trim())
            .content(request.content())
            .category(blankToNull(request.category()))
            .tags(request.tags() == null ? List.of() : List.copyOf(request.tags()))
            .status(DocumentTemplateStatus.ACTIVE)
            .createdByUserId(CurrentUser.id())
            .updatedByUserId(CurrentUser.id())
            .build();
    return toResponse(repository.save(clause));
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public ClauseResponse update(String id, ClauseRequest request) {
    DocumentClause clause = find(id);
    if (request.expectedRevision() != null
        && clause.getRevision() != null
        && !request.expectedRevision().equals(clause.getRevision())) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Điều khoản đã được cập nhật ở nơi khác, hãy tải lại");
    }
    clause.setTitle(request.title().trim());
    clause.setContent(request.content());
    clause.setCategory(blankToNull(request.category()));
    clause.setTags(request.tags() == null ? List.of() : List.copyOf(request.tags()));
    clause.setUpdatedByUserId(CurrentUser.id());
    return toResponse(repository.save(clause));
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public List<ClauseResponse> list(String query, String tag) {
    List<DocumentClause> clauses =
        CurrentUser.isAdmin()
            ? repository.findAllByOrderByUpdatedAtDesc()
            : repository.findByStatusOrderByUpdatedAtDesc(DocumentTemplateStatus.ACTIVE);
    String q = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
    String t = tag == null ? "" : tag.trim().toLowerCase(Locale.ROOT);
    return clauses.stream()
        .filter(clause -> q.isEmpty() || matches(clause, q))
        .filter(clause -> t.isEmpty() || hasTag(clause, t))
        .map(this::toResponse)
        .toList();
  }

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public ClauseResponse get(String id) {
    DocumentClause clause = find(id);
    if (!CurrentUser.isAdmin() && clause.getStatus() != DocumentTemplateStatus.ACTIVE) {
      throw notFound();
    }
    return toResponse(clause);
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public ClauseResponse archive(String id) {
    DocumentClause clause = find(id);
    clause.setStatus(DocumentTemplateStatus.ARCHIVED);
    clause.setUpdatedByUserId(CurrentUser.id());
    return toResponse(repository.save(clause));
  }

  private static boolean matches(DocumentClause clause, String q) {
    return contains(clause.getTitle(), q)
        || contains(clause.getContent(), q)
        || contains(clause.getCategory(), q);
  }

  private static boolean hasTag(DocumentClause clause, String tag) {
    return clause.getTags() != null
        && clause.getTags().stream().anyMatch(v -> v.toLowerCase(Locale.ROOT).contains(tag));
  }

  private static boolean contains(String value, String q) {
    return value != null && value.toLowerCase(Locale.ROOT).contains(q);
  }

  private DocumentClause find(String id) {
    return repository.findById(id).orElseThrow(this::notFound);
  }

  private ClauseResponse toResponse(DocumentClause clause) {
    return new ClauseResponse(
        clause.getId(),
        clause.getTitle(),
        clause.getContent(),
        clause.getCategory(),
        clause.getTags(),
        clause.getStatus(),
        clause.getCreatedByUserId(),
        clause.getUpdatedByUserId(),
        clause.getCreatedAt(),
        clause.getUpdatedAt(),
        clause.getRevision());
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }

  private ResponseStatusException notFound() {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy điều khoản");
  }
}
