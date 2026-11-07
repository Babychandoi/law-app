package org.law_app.backend.event;

/**
 * Khách vừa đăng ký tư vấn xong và đã ghi vào DB thành công.
 *
 * <p>Chỉ chứa chuỗi thuần, không mang entity: listener chạy sau khi transaction commit nên entity
 * lúc đó đã detach, đọc quan hệ lazy sẽ nổ LazyInitializationException.
 */
public record CustomerRegisteredEvent(
    String serviceName, String customerName, String phone, String email, String note) {}
