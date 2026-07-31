package org.law_app.document.service;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.law_app.document.domain.DocumentFolder;
import org.law_app.document.repository.DocumentFolderRepository;
import org.law_app.document.web.CurrentUser;
import org.law_app.document.web.Dtos.FolderRequest;
import org.law_app.document.web.Dtos.FolderResponse;
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
public class DocumentFolderServiceImpl implements DocumentFolderService {

  private final DocumentFolderRepository folderRepository;
  private final MongoTemplate mongoTemplate;

  @Override
  @PreAuthorize("hasAnyRole('ADMIN','USER')")
  public List<FolderResponse> list() {
    return folderRepository.findAllByOrderByNameAsc().stream().map(this::toResponse).toList();
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public FolderResponse create(FolderRequest request) {
    DocumentFolder folder =
        DocumentFolder.builder()
            .id(UUID.randomUUID().toString())
            .name(request.name().trim())
            .createdByUserId(CurrentUser.id())
            .build();
    return toResponse(folderRepository.save(folder));
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public FolderResponse rename(String id, FolderRequest request) {
    DocumentFolder folder =
        folderRepository
            .findById(id)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thư mục"));
    if (request.expectedRevision() != null
        && folder.getRevision() != null
        && !request.expectedRevision().equals(folder.getRevision())) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Thư mục đã đổi ở nơi khác, hãy tải lại");
    }
    folder.setName(request.name().trim());
    return toResponse(folderRepository.save(folder));
  }

  @Override
  @PreAuthorize("hasRole('ADMIN')")
  public void delete(String id) {
    if (!folderRepository.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thư mục");
    }
    // Gỡ folderId khỏi các mẫu thuộc thư mục (không xóa mẫu) rồi xóa thư mục.
    mongoTemplate.updateMulti(
        Query.query(Criteria.where("folderId").is(id)),
        Update.update("folderId", null),
        org.law_app.document.domain.DocumentTemplate.class);
    folderRepository.deleteById(id);
  }

  private FolderResponse toResponse(DocumentFolder folder) {
    return new FolderResponse(
        folder.getId(),
        folder.getName(),
        folder.getCreatedByUserId(),
        folder.getCreatedAt(),
        folder.getUpdatedAt(),
        folder.getRevision());
  }
}
