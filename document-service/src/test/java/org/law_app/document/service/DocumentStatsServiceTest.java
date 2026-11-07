package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.document.domain.DocumentBundle;
import org.law_app.document.domain.DocumentTemplate;
import org.law_app.document.domain.GeneratedDocument;
import org.law_app.document.web.Dtos.DocumentStatsResponse;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

/** P2.16: thống kê khối lượng — tổng đúng theo số đếm từng trạng thái. */
@ExtendWith(MockitoExtension.class)
class DocumentStatsServiceTest {

  @Mock private MongoTemplate mongoTemplate;

  @Test
  void aggregatesCountsPerEntity() {
    DocumentStatsService service = new DocumentStatsService(mongoTemplate);
    when(mongoTemplate.count(any(Query.class), eq(DocumentTemplate.class))).thenReturn(2L);
    when(mongoTemplate.count(any(Query.class), eq(GeneratedDocument.class))).thenReturn(5L);
    when(mongoTemplate.count(any(Query.class), eq(DocumentBundle.class))).thenReturn(3L);

    DocumentStatsResponse stats = service.stats();

    // DocumentTemplateStatus: DRAFT/ACTIVE/ARCHIVED = 3 trạng thái × 2.
    assertThat(stats.templatesTotal()).isEqualTo(6);
    assertThat(stats.templatesByStatus()).containsKeys("DRAFT", "ACTIVE", "ARCHIVED");
    // DocumentWorkflowStatus: 6 trạng thái × 5.
    assertThat(stats.generatedTotal()).isEqualTo(30);
    assertThat(stats.generatedByStatus()).hasSize(6);
    assertThat(stats.generatedLast30Days()).isEqualTo(5);
    assertThat(stats.bundlesActive()).isEqualTo(3);
  }
}
