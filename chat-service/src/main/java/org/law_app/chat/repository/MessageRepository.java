package org.law_app.chat.repository;

import org.law_app.chat.domain.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface MessageRepository extends MongoRepository<Message, String> {

  /** Latest-first page of a conversation; if {@code before} is null, returns the newest page. */
  @Query("{ 'conversationId': ?0, 'createdAt': { $lt: ?1 } }")
  java.util.List<Message> findPageBefore(
      String conversationId, java.time.Instant before, Pageable pageable);

  java.util.List<Message> findByConversationIdOrderByCreatedAtDesc(
      String conversationId, Pageable pageable);
}
