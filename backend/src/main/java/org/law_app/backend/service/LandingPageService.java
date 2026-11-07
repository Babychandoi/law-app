package org.law_app.backend.service;

import java.util.List;
import java.util.Optional;
import org.law_app.backend.dto.request.LandingPageRequest;
import org.law_app.backend.dto.response.LandingPageResponse;
import org.law_app.backend.dto.response.LandingPageViewResponse;

public interface LandingPageService {

  /**
   * Public: landing đã xuất bản theo slug, kèm nội dung trang dịch vụ. Rỗng khi slug không tồn tại
   * hoặc landing còn ở bản nháp — đây là trường hợp bình thường (404), không phải lỗi hệ thống.
   */
  Optional<LandingPageViewResponse> getPublishedBySlug(String slug);

  /** Admin: toàn bộ landing, gồm cả bản nháp. */
  List<LandingPageResponse> getAll();

  LandingPageResponse create(LandingPageRequest request);

  LandingPageResponse update(String id, LandingPageRequest request);

  Boolean delete(String id);
}
