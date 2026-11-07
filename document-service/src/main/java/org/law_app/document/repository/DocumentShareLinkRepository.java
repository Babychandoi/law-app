package org.law_app.document.repository;

import java.util.List;
import java.util.Optional;
import org.law_app.document.domain.DocumentShareLink;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DocumentShareLinkRepository extends MongoRepository<DocumentShareLink, String> {
  Optional<DocumentShareLink> findByTokenHash(String tokenHash);

  List<DocumentShareLink> findByGeneratedDocumentIdOrderByCreatedAtDesc(String generatedDocumentId);
}
