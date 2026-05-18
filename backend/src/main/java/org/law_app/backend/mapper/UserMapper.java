package org.law_app.backend.mapper;

import org.law_app.backend.common.Active;
import org.law_app.backend.dto.request.UserRequest;
import org.law_app.backend.dto.response.UserResponse;
import org.law_app.backend.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    default UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .active(user.getActive())
                .role(user.getRole())
                .email(user.getEmail())
                .phoneNumber(user.getPhone())
                .position(user.getPosition())
                .createdAt(user.getCreatedAt())
                .build();
    }
    default User toUser(UserRequest request) {
        return User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phone(request.getPhoneNumber())
                .role(request.getRole())
                .position(request.getPosition())
                .active(Active.ACTIVE) // Default to ACTIVE
                .build();
    }
    default void updateUser(User user, UserRequest request) {
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhoneNumber());
        user.setPosition(request.getPosition());
    }
}
