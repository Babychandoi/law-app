package org.law_app.backend.repository;

import org.law_app.backend.entity.News;
import org.law_app.backend.entity.SectionNews;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SectionNewsRepository extends JpaRepository<SectionNews, String> {
    // This interface will automatically provide CRUD operations for the SectionNews entity
    // Additional custom query methods can be defined here if needed
}
