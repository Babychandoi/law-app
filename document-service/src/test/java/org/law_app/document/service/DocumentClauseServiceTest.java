package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.document.domain.DocumentClause;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.law_app.document.repository.DocumentClauseRepository;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

/** P2.5/6: thư viện điều khoản — lọc theo từ khóa và tag. */
@ExtendWith(MockitoExtension.class)
class DocumentClauseServiceTest {

  @Mock private DocumentClauseRepository repository;
  @InjectMocks private DocumentClauseServiceImpl service;

  private DocumentClause clause(String title, String content, String... tags) {
    return DocumentClause.builder()
        .id(title)
        .title(title)
        .content(content)
        .status(DocumentTemplateStatus.ACTIVE)
        .tags(List.of(tags))
        .build();
  }

  @Test
  void filtersByQueryAndTag() {
    SecurityContextHolder.getContext()
        .setAuthentication(
            new UsernamePasswordAuthenticationToken(
                "u1", "n/a", List.of(new SimpleGrantedAuthority("ROLE_USER"))));
    try {
      when(repository.findByStatusOrderByUpdatedAtDesc(DocumentTemplateStatus.ACTIVE))
          .thenReturn(
              List.of(
                  clause("Bảo mật", "Các bên giữ bí mật thông tin", "nda"),
                  clause("Thanh toán", "Thanh toán trong 15 ngày", "payment"),
                  clause("Bảo hành", "Bảo hành 12 tháng", "warranty")));

      assertThat(service.list("thanh toán", null)).hasSize(1);
      assertThat(service.list(null, "nda"))
          .singleElement()
          .satisfies(c -> assertThat(c.title()).isEqualTo("Bảo mật"));
      assertThat(service.list(null, null)).hasSize(3);
    } finally {
      SecurityContextHolder.clearContext();
    }
  }
}
