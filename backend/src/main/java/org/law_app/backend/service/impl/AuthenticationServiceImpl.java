package org.law_app.backend.service.impl;

import com.nimbusds.jose.*;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.common.Active;
import org.law_app.backend.common.ErrorCode;
import org.law_app.backend.common.Role;
import org.law_app.backend.dto.request.*;
import org.law_app.backend.dto.response.AuthenticationResponse;
import org.law_app.backend.dto.response.IntrospectResponse;
import org.law_app.backend.dto.response.UserResponse;
import org.law_app.backend.mapper.UserMapper;
import org.law_app.backend.repository.UserRepository;
import org.law_app.backend.entity.User;
import org.law_app.backend.service.AuthenticationService;
import org.law_app.backend.service.TokenService;
import lombok.experimental.FieldDefaults;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
@Service
public class AuthenticationServiceImpl implements AuthenticationService {
    UserRepository userRepository;
    UserMapper userMapper;
    TokenService tokenService;
    public AuthenticationResponse authenticate(AuthenticationRequest request){
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!new BCryptPasswordEncoder().matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String accessToken = tokenService.generateAccessToken(user);
        String refreshToken = tokenService.generateRefreshToken(user);

        tokenService.saveRefreshToken(user.getId(), refreshToken, 30 * 24 * 60 * 60); // 30 ngày

        return AuthenticationResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .authenticated(true)
                .build();
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public UserResponse createUser(UserRequest request) {
        try {
            // Kiểm tra username đã tồn tại chưa
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new AppException(ErrorCode.USER_EXISTED);
            }

            // Mã hóa mật khẩu
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

            // Chuyển từ DTO sang Entity
            User user = userMapper.toUser(request);
            user.setPassword(passwordEncoder.encode(request.getPassword()));

            // Lưu user vào DB
            User newUser = userRepository.save(user);

            // Ép Hibernate thực hiện insert để @CreationTimestamp hoạt động
            userRepository.flush();

            // In ra createdAt để kiểm tra
            System.out.println("User created at: " + newUser.getCreatedAt());

            // Trả về DTO response
            return userMapper.toResponse(newUser);

        } catch (Exception e) {
            log.error("Error when create user", e);
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
    }


    @Override
    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        SignedJWT signedJWT = SignedJWT.parse(request.getToken());
        String userId = signedJWT.getJWTClaimsSet().getSubject();

        // Thu hồi access token
        tokenService.revokeAccessToken(request.getToken());

        // Xóa refresh token trong Redis
        tokenService.deleteRefreshToken(userId);
    }

    @Override
    public IntrospectResponse introspect(IntrospectRequest request) {
        boolean isValid = true;
        try {
            tokenService.verifyToken(request.getToken(), false);
        } catch (Exception e) {
            isValid = false;
        }
        return IntrospectResponse.builder()
                .valid(isValid)
                .build();
    }

    @Override
    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        String refreshToken = request.getRefreshToken();
        SignedJWT signedJWT = tokenService.verifyToken(refreshToken, true);

        // Kiểm tra type
        String type = (String) signedJWT.getJWTClaimsSet().getClaim("type");
        if (!"refresh".equals(type)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String userId = signedJWT.getJWTClaimsSet().getSubject();
        String stored = tokenService.getRefreshToken(userId);

        if (stored == null || !stored.equals(refreshToken)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Thu hồi refresh token cũ
        tokenService.revokeAccessToken(refreshToken);

        // Tạo token mới
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        String newAccessToken = tokenService.generateAccessToken(user);
        String newRefreshToken = tokenService.generateRefreshToken(user);

        tokenService.saveRefreshToken(
                userId,
                newRefreshToken,
                30 * 24 * 60 * 60
        );

        return AuthenticationResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .authenticated(true)
                .build();
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
        try {
            List<User> user = userRepository.findAll();
            return user
                    .stream()
                    .map(userMapper::toResponse).toList();
        }catch (Exception e) {
            log.error("Error when get users", e);
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
    }

    @Override
    public UserResponse updateUser(String id, UserRequest request) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            userMapper.updateUser(user, request);
            userRepository.save(user);
            return userMapper.toResponse(user);
        } catch (Exception e) {
            log.error("Error when update user", e);
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean changePassword(String id, String newPassword) {
        try{
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return true;
        }catch (Exception e) {
            log.error("Error when change password", e);
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean changeRole(String id, Role role) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            user.setRole(role);
            userRepository.save(user);
            return true;
        } catch (Exception e) {
            log.error("Error when change role", e);
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean changeActive(String id, Active active) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            user.setActive(active);
            userRepository.save(user);
            return true;
        } catch (Exception e) {
            log.error("Error when change active status", e);
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
    }

    @Override
    public UserResponse myProfile(String id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            return userMapper.toResponse(user);
        } catch (Exception e) {
            log.error("Error when get my profile", e);
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
    }


}
