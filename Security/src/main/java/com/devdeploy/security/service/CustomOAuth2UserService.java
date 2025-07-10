package com.devdeploy.security.service;

import com.devdeploy.security.entity.Role;
import com.devdeploy.security.entity.User;
import com.devdeploy.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String sub = (String) attributes.get("sub"); // Google's unique user ID
        String name = (String) attributes.getOrDefault("name", "Google User");
        String givenName = (String) attributes.getOrDefault("given_name", "");
        String familyName = (String) attributes.getOrDefault("family_name", "");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Create a new user with role USER
            User user = User.builder()
                    .username(email)
                    .email(email)
                    .password(passwordEncoder.encode(sub)) // Not used, but required by schema
                    .firstName(givenName)
                    .lastName(familyName)
                    .role(Role.USER)
                    .build();
            userRepository.save(user);
        }
        // Return a DefaultOAuth2User with ROLE_USER authority
        return new DefaultOAuth2User(
                Collections.singleton(() -> "ROLE_USER"),
                attributes,
                "sub"
        );
    }
} 