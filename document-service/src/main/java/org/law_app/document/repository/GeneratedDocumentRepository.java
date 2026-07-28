package org.law_app.document.repository;

import java.util.List;
import org.law_app.document.domain.GeneratedDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface GeneratedDocumentRepository extends MongoRepository<GeneratedDocument, String> {
  List<GeneratedDocument> findByCreatedByUserIdOrderByCreatedAtDesc(String createdByUserId);

  List<GeneratedDocument> findAllByOrderByCreatedAtDesc();
}
