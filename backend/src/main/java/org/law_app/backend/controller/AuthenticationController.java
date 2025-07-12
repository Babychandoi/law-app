package org.law_app.backend.controller;


import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.law_app.backend.common.Active;
import org.law_app.backend.common.Role;
import org.law_app.backend.dto.request.*;
import org.law_app.backend.dto.response.AuthenticationResponse;
import org.law_app.backend.dto.response.IntrospectResponse;
import org.law_app.backend.dto.response.UserResponse;
import org.law_app.backend.service.AuthenticationService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.law_app.backend.dto.response.ApiResponse;
import java.text.ParseException;
import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true , level = AccessLevel.PRIVATE)
public class AuthenticationController {
    AuthenticationService authenticationService;
    @PostMapping("/login")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request){
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .data(result)
                .message(result.isAuthenticated() ? "Login successful" : "Login failed")
                .build();

    }
    @PostMapping("/users")
    ApiResponse<UserResponse> createUser(@RequestBody UserRequest request) {
        var result = authenticationService.createUser(request);
        return ApiResponse.<UserResponse>builder()
                .data(result)
                .message("User created successfully")
                .build();
    }
    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse>authenticate(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder()
                .data(result)
                .message(result.isValid() ? "Token is valid" : "Token is invalid")
                .build();
    }
    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest request)
            throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder()
                .message("Logout successful")
                .build();
    }
    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody RefreshRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.refreshToken(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .data(result)
                .build();

    }
    @GetMapping("/users")
    ApiResponse<List<UserResponse>> getUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .data(authenticationService.getUsers())
                .message("Users retrieved successfully")
                .build();
    }
    @PutMapping("/users/{id}")
    ApiResponse<UserResponse> updateUser(@PathVariable String id, @RequestBody UserRequest request) {
        var result = authenticationService.updateUser(id, request);
        return ApiResponse.<UserResponse>builder()
                .data(result)
                .message("User updated successfully")
                .build();
    }
    @PutMapping("/users/{id}/password")
    ApiResponse<Boolean> changePassword(@PathVariable String id, @RequestParam String newPassword) {
        var result = authenticationService.changePassword(id, newPassword);
        return ApiResponse.<Boolean>builder()
                .data(result)
                .message(result ? "Password changed successfully" : "Password change failed")
                .build();
    }
    @PutMapping("/users/{id}/role")
    ApiResponse<Boolean> changeRole(@PathVariable String id, @RequestParam Role role) {
        var result = authenticationService.changeRole(id, role);
        return ApiResponse.<Boolean>builder()
                .data(result)
                .message(result ? "Role changed successfully" : "Role change failed")
                .build();
    }
    @PutMapping("/users/{id}/active")
    ApiResponse<Boolean> changeActive(@PathVariable String id, @RequestParam Active active) {
        var result = authenticationService.changeActive(id, active);
        return ApiResponse.<Boolean>builder()
                .data(result)
                .message(result ? "User status changed successfully" : "User status change failed")
                .build();
    }
    @GetMapping("/me")
    ApiResponse<UserResponse> getMyAccount() {
        var context = SecurityContextHolder.getContext();
        String id = context.getAuthentication().getName();
        return ApiResponse.<UserResponse>builder()
                .data(authenticationService.myProfile(id))
                .message("My account retrieved successfully")
                .build();
    }
}
