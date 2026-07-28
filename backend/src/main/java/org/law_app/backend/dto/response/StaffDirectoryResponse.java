package org.law_app.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.law_app.backend.common.Role;

/**
 * Danh bạ nhân sự tối giản dùng cho chat nội bộ (chat-service proxy sang). Cố tình KHÔNG chứa
 * email/điện thoại/trạng thái — đây là dữ liệu mọi nhân viên đã đăng nhập đều xem được, khác với
 * {@link UserResponse} (quản lý người dùng, chỉ ADMIN).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class StaffDirectoryResponse {
  String id;
  String username;
  String fullName;
  Role role;
  String position;
}
