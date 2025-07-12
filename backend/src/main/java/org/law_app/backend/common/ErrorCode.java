package org.law_app.backend.common;

import lombok.Data;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {

    UNCATEGORIZED_EXCEPTION(9999,"Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1000,"Invalid key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1001,"User already exists", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1004,"User not exists", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(1006,"You do not permission", HttpStatus.FORBIDDEN),
    USERNAME_INVALID(1002,"Username must be at least 4 characters long", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1003,"Password must be at least 4 characters long", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1005,"Unauthenticated", HttpStatus.UNAUTHORIZED),;
    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;
    ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }

}