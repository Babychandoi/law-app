package org.law_app.backend.dto.response;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

/** Unit test thuần (không cần Spring context) cho ApiMeta — nền tảng phân trang server-side. */
class ApiMetaTest {

  @Test
  void from_mapsPageMetadata_middlePage() {
    var page = new PageImpl<>(List.of("a", "b"), PageRequest.of(1, 2), 10);
    ApiMeta m = ApiMeta.from(page);
    assertEquals(1, m.getPage());
    assertEquals(2, m.getSize());
    assertEquals(10, m.getTotalElements());
    assertEquals(5, m.getTotalPages());
    assertTrue(m.isHasNext());
    assertTrue(m.isHasPrevious());
  }

  @Test
  void from_firstPage_noPrevious() {
    var page = new PageImpl<>(List.of("a"), PageRequest.of(0, 5), 3);
    ApiMeta m = ApiMeta.from(page);
    assertEquals(0, m.getPage());
    assertEquals(1, m.getTotalPages());
    assertFalse(m.isHasNext());
    assertFalse(m.isHasPrevious());
  }
}
