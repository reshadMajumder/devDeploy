package com.devdeploy.security.service;

import com.devdeploy.security.config.JwtService;
import com.devdeploy.security.dto.AuthenticationRequest;
import com.devdeploy.security.dto.AuthenticationResponse;
import com.devdeploy.security.dto.RegisterRequest;
import com.devdeploy.security.entity.Role;
import com.devdeploy.security.entity.User;
import com.devdeploy.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        if (repository.existsByUsername(request.getUsername())) {
            return AuthenticationResponse.builder()
                    .message("Username already exists")
                    .build();
        }
        
        if (repository.existsByEmail(request.getEmail())) {
            return AuthenticationResponse.builder()
                    .message("Email already exists")
                    .build();
        }

        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(Role.valueOf(request.getRole().toUpperCase()))
                .build();
        repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .message("User registered successfully")
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user = repository.findByUsername(request.getUsername())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .message("Authentication successful")
                .build();
    }
} 