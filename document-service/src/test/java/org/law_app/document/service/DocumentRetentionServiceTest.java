package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.document.domain.GeneratedDocument;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.test.util.ReflectionTestUtils;

/** P2.11: retention — ẩn mềm tài liệu tạo trước mốc (now - days), giữ nguyên (không xóa). */
@ExtendWith(MockitoExtension.class)
class DocumentRetentionServiceTest {

  @Mock private MongoTemplate mongoTemplate;

  @Test
  void hidesDocumentsOlderThanRetentionWindow() {
    DocumentRetentionService service = new DocumentRetentionService(mongoTemplate);
    ReflectionTestUtils.setField(service, "retentionDays", 365L);

    com.mongodb.client.result.UpdateResult result =
        com.mongodb.client.result.UpdateResult.acknowledged(3, 3L, null);
    when(mongoTemplate.updateMulti(
            any(Query.class), any(Update.class), eq(GeneratedDocument.class)))
        .thenReturn(result);

    Instant now = Instant.parse("2026-07-31T00:00:00Z");
    long hidden = service.runRetention(now);

    assertThat(hidden).isEqualTo(3);
    ArgumentCaptor<Query> queryCaptor = ArgumentCaptor.forClass(Query.class);
    ArgumentCaptor<Update> updateCaptor = ArgumentCaptor.forClass(Update.class);
    org.mockito.Mockito.verify(mongoTemplate)
        .updateMulti(queryCaptor.capture(), updateCaptor.capture(), eq(GeneratedDocument.class));
    // Điều kiện lọc theo ngày tạo + chưa bị ẩn.
    assertThat(queryCaptor.getValue().getQueryObject().keySet())
        .contains("createdAt", "hiddenByRetention");
    assertThat(updateCaptor.getValue().getUpdateObject().containsKey("$set")).isTrue();
  }
}
