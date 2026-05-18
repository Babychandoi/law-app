package org.law_app.backend.service;


import com.nimbusds.jose.JOSEException;
import org.law_app.backend.common.Active;
import org.law_app.backend.common.Role;
import org.law_app.backend.dto.request.*;
import org.law_app.backend.dto.response.AuthenticationResponse;
import org.law_app.backend.dto.response.IntrospectResponse;
import org.law_app.backend.dto.response.UserResponse;


import java.text.ParseException;
import java.util.List;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request);
    UserResponse createUser(UserRequest request);
    IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException;
    void logout(LogoutRequest request) throws JOSEException, ParseException;
    AuthenticationResponse refreshToken(RefreshRequest request)throws ParseException, JOSEException;
    List<UserResponse> getUsers();
    UserResponse updateUser(String id, UserRequest request);
    Boolean changePassword(String id, String newPassword);
    Boolean changeRole(String id , Role role);
    Boolean changeActive(String id, Active active);
    UserResponse myProfile(String id);
}
