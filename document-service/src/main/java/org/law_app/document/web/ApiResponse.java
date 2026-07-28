package org.law_app.document.web;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
  @Builder.Default private int code = 200;
  private String message;
  private T data;
  private Object meta;

  public static <T> ApiResponse<T> ok(T data) {
    return ApiResponse.<T>builder().code(200).data(data).build();
  }

  public static <T> ApiResponse<T> ok(T data, String message) {
    return ApiResponse.<T>builder().code(200).data(data).message(message).build();
  }
}
