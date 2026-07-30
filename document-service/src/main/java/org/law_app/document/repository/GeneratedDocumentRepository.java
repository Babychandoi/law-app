package org.law_app.document.repository;

import java.util.List;
import java.util.Optional;
import org.law_app.document.domain.GeneratedDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface GeneratedDocumentRepository extends MongoRepository<GeneratedDocument, String> {
  List<GeneratedDocument> findByCreatedByUserIdOrderByCreatedAtDesc(String createdByUserId);

  List<GeneratedDocument> findAllByOrderByCreatedAtDesc();

  Page<GeneratedDocument> findByCreatedByUserId(String createdByUserId, Pageable pageable);

  Page<GeneratedDocument> findAll(Pageable pageable);

  Optional<GeneratedDocument> findByIdempotencyScope(String idempotencyScope);
}
