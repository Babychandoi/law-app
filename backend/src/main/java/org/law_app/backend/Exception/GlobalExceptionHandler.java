package org.law_app.backend.Exception;

import java.util.LinkedHashMap;
import java.util.Map;
import org.law_app.backend.common.ErrorCode;
import org.law_app.backend.dto.request.AppException;
import org.law_app.backend.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(value = Exception.class)
  ResponseEntity<ApiResponse> handleRuntimeException(Exception e) {
    ApiResponse response = new ApiResponse();
    response.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
    response.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());
    return ResponseEntity.status(ErrorCode.UNCATEGORIZED_EXCEPTION.getHttpStatusCode())
        .body(response);
  }

  @ExceptionHandler(value = AccessDeniedException.class)
  ResponseEntity<ApiResponse> handleAccessDeniedException(AccessDeniedException e) {
    ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
    return ResponseEntity.status(errorCode.getHttpStatusCode())
        .body(
            ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build());
  }

  @ExceptionHandler(value = MethodArgumentNotValidException.class)
  ResponseEntity<ApiResponse> handlingValidation(MethodArgumentNotValidException e) {
    Map<String, String> errors = new LinkedHashMap<>();
    for (FieldError fieldError : e.getBindingResult().getFieldErrors()) {
      errors.put(fieldError.getField(), fieldError.getDefaultMessage());
    }
    ErrorCode errorCode = ErrorCode.INVALID_KEY;
    ApiResponse response =
        ApiResponse.builder()
            .code(errorCode.getCode())
            .message(errorCode.getMessage())
            .errors(errors)
            .build();
    return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
  }

  @ExceptionHandler(value = AppException.class)
  ResponseEntity<ApiResponse> handleAppException(AppException e) {
    ErrorCode errorCode = e.getErrorCode();
    ApiResponse response =
        ApiResponse.builder().code(errorCode.getCode()).message(errorCode.getMessage()).build();
    return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
  }
}
