package com.devdeploy.security.controller;

import com.devdeploy.security.dto.AuthenticationResponse;
// import com.devdeploy.security.service.OAuth2AuthenticationService;
// import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/oauth2")
// @RequiredArgsConstructor
public class OAuth2Controller {

    // private final OAuth2AuthenticationService oAuth2AuthenticationService;

    @GetMapping("/login/google")
    public ResponseEntity<String> loginWithGoogle() {
        // This endpoint will redirect to Google OAuth2 authorization
        return ResponseEntity.ok("Redirect to: /oauth2/authorization/google");
    }

    @GetMapping("/success")
    public ResponseEntity<String> loginSuccess(
            @AuthenticationPrincipal OAuth2User principal
    ) {
        try {
            return ResponseEntity.ok("OAuth2 login successful! User: " + principal.getAttribute("name"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<OAuth2User> getUser(@AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.ok(principal);
    }
}
