package com.devdeploy.security.config;

import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    public CustomOAuth2SuccessHandler() {
        super("http://localhost:5173/dashboard"); // Redirect to React dashboard
    }
} 