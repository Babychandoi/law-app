package org.law_app.backend.repository;

import java.util.List;
import org.law_app.backend.entity.NewsVersion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsVersionRepository extends JpaRepository<NewsVersion, String> {
  List<NewsVersion> findByNewsIdOrderByCreatedAtDesc(String newsId);
}
