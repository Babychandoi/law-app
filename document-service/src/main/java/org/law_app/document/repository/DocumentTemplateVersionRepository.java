package org.law_app.document.repository;

import java.util.Optional;
import org.law_app.document.domain.DocumentTemplateVersion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DocumentTemplateVersionRepository
    extends MongoRepository<DocumentTemplateVersion, String> {
  Page<DocumentTemplateVersion> findByTemplateId(String templateId, Pageable pageable);

  Optional<DocumentTemplateVersion> findByTemplateIdAndVersionNumber(
      String templateId, int versionNumber);
}
