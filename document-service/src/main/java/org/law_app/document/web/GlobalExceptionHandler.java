package org.law_app.document.web;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResponseStatusException.class)
  ResponseEntity<ApiResponse<Void>> handleStatus(ResponseStatusException e) {
    int status = e.getStatusCode().value();
    return ResponseEntity.status(status)
        .body(ApiResponse.<Void>builder().code(status).message(e.getReason()).build());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException e) {
    Map<String, String> errors =
        e.getBindingResult().getFieldErrors().stream()
            .collect(
                java.util.stream.Collectors.toMap(
                    fe -> fe.getField(),
                    fe -> fe.getDefaultMessage() == null ? "Không hợp lệ" : fe.getDefaultMessage(),
                    (a, b) -> a));
    return ResponseEntity.badRequest()
        .body(
            ApiResponse.<Void>builder()
                .code(HttpStatus.BAD_REQUEST.value())
                .message("Dữ liệu không hợp lệ")
                .meta(errors)
                .build());
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiResponse<Void>> handleGeneric(Exception e) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(
            ApiResponse.<Void>builder()
                .code(500)
                .message(e.getMessage() == null ? "Lỗi hệ thống" : e.getMessage())
                .build());
  }
}
