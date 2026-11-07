package org.law_app.document.web;

import jakarta.validation.ConstraintViolationException;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResponseStatusException.class)
  ResponseEntity<ApiResponse<Void>> handleStatus(ResponseStatusException exception) {
    int status = exception.getStatusCode().value();
    return ResponseEntity.status(status)
        .body(ApiResponse.<Void>builder().code(status).message(exception.getReason()).build());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException exception) {
    Map<String, String> errors =
        exception.getBindingResult().getFieldErrors().stream()
            .collect(
                java.util.stream.Collectors.toMap(
                    error -> error.getField(),
                    error ->
                        error.getDefaultMessage() == null
                            ? "Không hợp lệ"
                            : error.getDefaultMessage(),
                    (first, ignored) -> first));
    return ResponseEntity.badRequest()
        .body(
            ApiResponse.<Void>builder()
                .code(HttpStatus.BAD_REQUEST.value())
                .message("Dữ liệu không hợp lệ")
                .meta(errors)
                .build());
  }

  @ExceptionHandler(ConstraintViolationException.class)
  ResponseEntity<ApiResponse<Void>> handleConstraint(ConstraintViolationException exception) {
    return ResponseEntity.badRequest()
        .body(
            ApiResponse.<Void>builder()
                .code(HttpStatus.BAD_REQUEST.value())
                .message("Dữ liệu không hợp lệ")
                .build());
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  ResponseEntity<ApiResponse<Void>> handleUnreadable(HttpMessageNotReadableException exception) {
    return ResponseEntity.badRequest()
        .body(
            ApiResponse.<Void>builder()
                .code(HttpStatus.BAD_REQUEST.value())
                .message("JSON hoặc giá trị enum không hợp lệ")
                .build());
  }

  @ExceptionHandler(MaxUploadSizeExceededException.class)
  ResponseEntity<ApiResponse<Void>> handleUploadLimit(MaxUploadSizeExceededException exception) {
    return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
        .body(
            ApiResponse.<Void>builder()
                .code(HttpStatus.PAYLOAD_TOO_LARGE.value())
                .message("File upload vượt quá giới hạn")
                .build());
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ResponseEntity<ApiResponse<Void>> handleIntegrity(DataIntegrityViolationException exception) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(
            ApiResponse.<Void>builder()
                .code(HttpStatus.CONFLICT.value())
                .message("Dữ liệu đã được cập nhật hoặc bị trùng")
                .build());
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiResponse<Void>> handleGeneric(Exception exception) {
    // Do not return driver/object-storage messages; they may contain credentials or PII.
    log.error("Unhandled document-service error type={}", exception.getClass().getName());
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.<Void>builder().code(500).message("Lỗi hệ thống").build());
  }
}
