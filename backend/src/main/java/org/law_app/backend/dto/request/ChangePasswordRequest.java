package org.law_app.backend.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

/**
 * Body cho đổi mật khẩu. Không truyền mật khẩu qua query string để tránh lọt vào access log / proxy
 * log và hỏng với ký tự đặc biệt.
 */
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChangePasswordRequest {
  String newPassword;
}
