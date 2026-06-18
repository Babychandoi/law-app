package org.law_app.chat.repository;

import java.util.List;
import org.law_app.chat.domain.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ConversationRepository extends MongoRepository<Conversation, String> {
  /**
   * Returns matches sorted oldest-first. Normally 0 or 1, but tolerates legacy duplicates (created
   * before the unique index existed) without throwing — caller picks the first.
   */
  List<Conversation> findByDirectKeyOrderByCreatedAtAsc(String directKey);
}
