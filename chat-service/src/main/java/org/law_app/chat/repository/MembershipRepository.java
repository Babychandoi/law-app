package org.law_app.chat.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.law_app.chat.domain.Membership;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MembershipRepository extends MongoRepository<Membership, String> {

  List<Membership> findByUserIdOrderByUpdatedAtDesc(String userId);

  List<Membership> findByConversationId(String conversationId);

  /** Batch load memberships cho nhiều hội thoại (tránh N+1 khi dựng inbox). */
  List<Membership> findByConversationIdIn(Collection<String> conversationIds);

  Optional<Membership> findByConversationIdAndUserId(String conversationId, String userId);

  boolean existsByConversationIdAndUserId(String conversationId, String userId);

  void deleteByConversationIdAndUserId(String conversationId, String userId);
}
