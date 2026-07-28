package org.law_app.backend.dto.response;

import lombok.Builder;
import lombok.Value;
import org.springframework.data.domain.Page;

@Value
@Builder
public class ApiMeta {
  int page;
  int size;
  long totalElements;
  int totalPages;
  boolean hasNext;
  boolean hasPrevious;

  public static ApiMeta from(Page<?> page) {
    return ApiMeta.builder()
        .page(page.getNumber())
        .size(page.getSize())
        .totalElements(page.getTotalElements())
        .totalPages(page.getTotalPages())
        .hasNext(page.hasNext())
        .hasPrevious(page.hasPrevious())
        .build();
  }
}
