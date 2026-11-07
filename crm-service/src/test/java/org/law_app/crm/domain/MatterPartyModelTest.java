package org.law_app.crm.domain;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.persistence.Version;
import java.util.Arrays;
import org.hibernate.annotations.Immutable;
import org.junit.jupiter.api.Test;
import org.law_app.crm.repository.MatterPartyAuditRepository;

class MatterPartyModelTest {

  @Test
  void partyRevisionUsesJpaOptimisticLocking() throws NoSuchFieldException {
    assertThat(MatterParty.class.getDeclaredField("revision").isAnnotationPresent(Version.class))
        .isTrue();
  }

  @Test
  void auditModelIsImmutableAndContainsNoPiiPayloadFields() {
    assertThat(MatterPartyAudit.class.isAnnotationPresent(Immutable.class)).isTrue();
    assertThat(
            Arrays.stream(MatterPartyAudit.class.getDeclaredFields())
                .map(java.lang.reflect.Field::getName))
        .doesNotContain(
            "encryptedPii",
            "displayName",
            "email",
            "phone",
            "address",
            "notes",
            "identityDocumentNumber",
            "taxIdentifier");
  }

  @Test
  void auditRepositoryDoesNotExposeUpdateOrDeleteOperations() {
    assertThat(
            Arrays.stream(MatterPartyAuditRepository.class.getMethods())
                .map(java.lang.reflect.Method::getName))
        .contains("save")
        .noneMatch(name -> name.startsWith("delete") || name.equals("saveAll"));
  }
}
