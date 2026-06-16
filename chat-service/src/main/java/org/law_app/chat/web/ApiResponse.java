package org.law_app.chat.web;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Mirrors the monolith's response envelope so the frontend handles both uniformly. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
  @Builder.Default private int code = 200;
  private String message;
  private T data;

  public static <T> ApiResponse<T> ok(T data) {
    return ApiResponse.<T>builder().code(200).data(data).build();
  }

  public static <T> ApiResponse<T> ok(T data, String message) {
    return ApiResponse.<T>builder().code(200).data(data).message(message).build();
  }
}
