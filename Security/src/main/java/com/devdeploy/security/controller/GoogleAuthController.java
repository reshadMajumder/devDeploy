//package com.devdeploy.security.controller;
//
//import com.devdeploy.security.entity.User;
//import com.devdeploy.security.repository.UserRepository;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.*;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.Arrays;
//import java.util.HashMap;
//import java.util.Map;
//import java.util.UUID;
//
//@RestController
//@RequestMapping("/auth/google")
//@Slf4j
//public class GoogleAuthController {
//
//    @Value("${spring.security.oauth2.client.registration.google.client-id}")
//    private String clientId;
//
//    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
//    private String clientSecret;
//
//    @Autowired
//    private RestTemplate restTemplate;
//
//    @Autowired
//    UserDetailsService userDetailsService;
//
//    @Autowired
//    PasswordEncoder passwordEncoder;
//
//    @Autowired
//    UserRepository userRepository;
//
//    @GetMapping("/callback")
//    public ResponseEntity<?> handleGoogleCallback(@RequestParam String code) {
//
//        try {
//            // 1. Exchange Auth code for token
//            String tokenEndPoint = "https://oauth2.googleapis.com/token";
//
//            Map<String, String> params = new HashMap<>();
//            params.put("code", code);
//            params.put("client_id", clientId);
//            params.put("client_secret",clientSecret);
//            params.put("redirect_uri","https://developers.google.com/oauthplayground");
//            params.put("grant_type","authorization_code");
//
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
//
//            HttpEntity<Map<String, String>> request = new HttpEntity<>(params,headers);
//
//            ResponseEntity<Map> tokenResponse= restTemplate.postForEntity(tokenEndPoint,request,Map.class);
//            String idToken = (String) tokenResponse.getBody().get("id_token");
//            String userInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token="+idToken;
//            ResponseEntity<Map> userInfoResponse= restTemplate.getForEntity(userInfoUrl,Map.class);
//            if(userInfoResponse.getStatusCode() == HttpStatus.OK){
//                Map<String,Object> userInfo=userInfoResponse.getBody();
//                String email=(String)userInfo.get("email");
//                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
//                if(userDetails == null) {
//                    User user = new User();
//                    user.setEmail(email);
//                    user.setUsername(email);
//                    user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
//                    user.setRole(Arrays.asList("USER"));
//                    userRepository.save(user);
//                    userDetails = userDetailsService.loadUserByUsername(email);
//                }
//
//                UsernamePasswordAuthenticationToken authenticationToken = new
//                        UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
//                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
//
//                return ResponseEntity.status(HttpStatus.OK).build();
//            }
//         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//
//        }catch (Exception ex){
//            log.error("Exception occurred while handleGoogleCallBack",ex);
//           return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//}
