package com.example.RestaurantFinder.controller;
import com.example.RestaurantFinder.model.User;
import com.example.RestaurantFinder.dtos.LoginUserDto;
import com.example.RestaurantFinder.dtos.RegisterUserDto;
import com.example.RestaurantFinder.responses.LoginResponse;
import com.example.RestaurantFinder.service.AuthenticationService;
import com.example.RestaurantFinder.service.JwtService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;


@RequestMapping("/auth")
@RestController
public class AuthenticationController {
    private final JwtService jwtService;
    
    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterUserDto registerUserDto) {
        try {
            User registeredUser = authenticationService.signup(registerUserDto);
            return ResponseEntity.ok(registeredUser);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            e.getMessage(),
                            LocalDateTime.now()
                    ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody LoginUserDto loginUserDto) {
        try {
            User authenticatedUser = authenticationService.authenticate(loginUserDto);

            // Create claims with user ID
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("userId", authenticatedUser.getId());
            // You can add more claims if needed
            extraClaims.put("role", authenticatedUser.getRole());

            String jwtToken = jwtService.generateToken(extraClaims, authenticatedUser);

            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setToken(jwtToken);
            loginResponse.setExpiresIn(jwtService.getExpirationTime());
            loginResponse.setUserId(authenticatedUser.getId().toString());

            return ResponseEntity.ok(loginResponse);
        } catch (AuthenticationException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(
                            HttpStatus.UNAUTHORIZED.value(),
                            "Invalid credentials",
                            LocalDateTime.now()
                    ));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            e.getMessage(),
                            LocalDateTime.now()
                    ));
        }
    }

    @Data
    @AllArgsConstructor
    public class ErrorResponse {
        private int status;
        private String message;
        private LocalDateTime timestamp;
    }
}