package org.law_app.document.service;

import java.time.Duration;
import java.time.Instant;
import lombok.extern.slf4j.Slf4j;
import org.law_app.document.domain.GeneratedDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Chính sách lưu trữ (retention) tài liệu đã tạo: quá hạn thì ẩn MỀM (đánh dấu {@code
 * hiddenByRetention}) — giữ nguyên file + metadata để admin xem/khôi phục, KHÔNG xóa. Tắt được bằng
 * cấu hình; mặc định 365 ngày.
 */
@Slf4j
@Service
public class DocumentRetentionService {

  private final MongoTemplate mongoTemplate;

  @Value("${document.retention.enabled:true}")
  private boolean enabled;

  @Value("${document.retention.days:365}")
  private long retentionDays;

  public DocumentRetentionService(MongoTemplate mongoTemplate) {
    this.mongoTemplate = mongoTemplate;
  }

  @Scheduled(cron = "${document.retention.cron:0 30 3 * * *}")
  public void scheduledRetention() {
    if (!enabled) {
      log.debug("Document retention disabled");
      return;
    }
    try {
      long hidden = runRetention(Instant.now());
      if (hidden > 0) log.info("Document retention: hid {} expired documents", hidden);
    } catch (RuntimeException e) {
      log.error("Document retention failed: {}", e.getClass().getSimpleName());
    }
  }

  /** Ẩn mềm các tài liệu tạo trước mốc (now - retentionDays) mà chưa bị ẩn. Trả về số bản ghi. */
  public long runRetention(Instant now) {
    Instant cutoff = now.minus(Duration.ofDays(Math.max(1, retentionDays)));
    Query query =
        Query.query(Criteria.where("createdAt").lt(cutoff).and("hiddenByRetention").ne(true));
    Update update = Update.update("hiddenByRetention", true).set("retentionHiddenAt", now);
    return mongoTemplate.updateMulti(query, update, GeneratedDocument.class).getModifiedCount();
  }
}
