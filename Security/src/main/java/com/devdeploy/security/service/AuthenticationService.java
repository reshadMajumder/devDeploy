package com.devdeploy.security.service;

import com.devdeploy.security.dto.AuthenticationRequest;
import com.devdeploy.security.dto.AuthenticationResponse;
import com.devdeploy.security.dto.RegisterRequest;
import com.devdeploy.security.entity.Role;
import com.devdeploy.security.entity.User;
import com.devdeploy.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        return registerUser(request, Role.USER);
    }

    public AuthenticationResponse registerAdmin(RegisterRequest request) {
        return registerUser(request, Role.ADMIN);
    }

    private AuthenticationResponse registerUser(RegisterRequest request, Role role) {
        // Check if user already exists
        if (repository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (repository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        var user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(role)
                .build();
        repository.save(user);
        
        var jwtToken = jwtService.generateToken(user);
        return buildAuthenticationResponse(user, jwtToken);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        
        var user = repository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        var jwtToken = jwtService.generateToken(user);
        return buildAuthenticationResponse(user, jwtToken);
    }

    private AuthenticationResponse buildAuthenticationResponse(User user, String token) {
        return AuthenticationResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build();
    }
}
