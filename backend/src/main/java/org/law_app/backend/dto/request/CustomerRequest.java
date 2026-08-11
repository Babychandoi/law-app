package org.law_app.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Yêu cầu đăng ký tư vấn từ form công khai.
 *
 * <p>Ràng buộc độ dài đặt ở đây để dữ liệu quá dài bị chặn ngay với HTTP 400 kèm thông báo rõ, thay
 * vì đi xuống MySQL rồi vỡ ở "Data too long" và trả 500 — trường hợp đó transaction rollback nên
 * lead mất trắng mà email xác nhận vẫn gửi đi (email chạy @Async, ngoài transaction).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomerRequest {

  @NotBlank(message = "Vui lòng nhập họ và tên")
  @Size(max = 255, message = "Họ và tên không vượt quá 255 ký tự")
  String name;

  @Email(message = "Email không hợp lệ")
  @Size(max = 255, message = "Email không vượt quá 255 ký tự")
  String email;

  @NotBlank(message = "Vui lòng nhập số điện thoại")
  @Size(max = 32, message = "Số điện thoại không vượt quá 32 ký tự")
  String phone;

  // Cột đã đổi sang TEXT (tối đa 65535 byte). Chặn ở 5000 ký tự: đủ cho mô tả vụ việc chi tiết
  // nhất, đồng thời không để bot nhồi hàng chục KB rác vào mỗi lượt gửi.
  @Size(max = 5000, message = "Nội dung cần tư vấn không vượt quá 5000 ký tự")
  String description;

  @NotBlank(message = "Vui lòng chọn dịch vụ cần tư vấn")
  String serviceId;
}
