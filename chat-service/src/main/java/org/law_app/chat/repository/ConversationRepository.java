package org.law_app.chat.repository;

import java.util.Optional;
import org.law_app.chat.domain.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ConversationRepository extends MongoRepository<Conversation, String> {
  Optional<Conversation> findByDirectKey(String directKey);
}
