package com.example.RestaurantFinder.controller;

import com.example.RestaurantFinder.dtos.RegisterUserDto;
import com.example.RestaurantFinder.model.User;
import com.example.RestaurantFinder.service.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/admins")
@RestController
public class AdminController {
    private final AuthenticationService authenticationService;

    public AdminController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createAdministrator(@RequestBody RegisterUserDto registerUserDto) {
        System.out.println("role validated as admin");
        User createdAdmin = authenticationService.createAdministrator(registerUserDto);
        
        return ResponseEntity.ok(createdAdmin);
    }
}