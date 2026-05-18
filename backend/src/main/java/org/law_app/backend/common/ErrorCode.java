package org.law_app.backend.common;

import lombok.Data;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {

    UNCATEGORIZED_EXCEPTION(9999,"Lỗi không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1000,"Khóa không hợp lệ", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1001,"Tên đăng nhập đã tồn tại", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1004,"Tài khoản không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(1006,"Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
    USERNAME_INVALID(1002,"Tên đăng nhập phải có ít nhất 4 ký tự", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1003,"Mật khẩu phải có ít nhất 4 ký tự", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1005,"Tên đăng nhập hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED),;
    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;
    ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }

}