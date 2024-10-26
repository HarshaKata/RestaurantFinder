package com.example.RestaurantFinder.service;

import java.util.Collection;
import java.util.Objects;
import java.util.Optional;
import com.example.RestaurantFinder.dtos.LoginUserDto;
import com.example.RestaurantFinder.dtos.RegisterUserDto;
import com.example.RestaurantFinder.model.RoleEnum;
import com.example.RestaurantFinder.model.Role;
import com.example.RestaurantFinder.model.User;
import com.example.RestaurantFinder.repo.UserRepository;
import com.example.RestaurantFinder.repo.RoleRepository;

// import org.hibernate.mapping.Collection;
// import org.apache.el.stream.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;
    private final RoleRepository roleRepository;

    public AuthenticationService(
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder,
            RoleRepository roleRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
    }

    public Optional<Role> findUserRole(String roleName) {
        if (roleName.equals("USER")) {
            return roleRepository.findByName(RoleEnum.USER);
        } else if (roleName.equals("ADMIN")) {
            return roleRepository.findByName(RoleEnum.ADMIN);
        } else if (roleName.equals("OWNER")) {
            return roleRepository.findByName(RoleEnum.OWNER);
        }
        return roleRepository.findByName(RoleEnum.USER);
    }

    public User signup(RegisterUserDto input) throws Exception {
        if(Objects.nonNull(userRepository.findUserByEmail(input.getEmail()))){
            throw new Exception("User with this email already exists , please use another email");
        }

        var user = new User();
        user.setUserName(input.getUserName());
        user.setEmail(input.getEmail());
        user.setPassword(passwordEncoder.encode(input.getPassword()));
        Role role = findUserRole(input.getRole()).get();
        System.out.println(input.getRole());
        if (input.getRole() != null) {
            if (input.getRole().equalsIgnoreCase("BUSINESS_OWNER")) {
                role = findUserRole("OWNER").get();
            }

            else if (input.getRole().equalsIgnoreCase("ADMIN")) {
                System.out.println("entered else if");
                // Only allow admin creation through another admin
                if (isAdminCreatingUser()) {
                    role = findUserRole("ADMIN").get();
                } else {
                    System.out.println("invalid code");
                    throw new AccessDeniedException("Only admins can create other admin accounts");

                }
            }
        }

        user.setRole(role);
        return userRepository.save(user);
    }
    public User createAdministrator(RegisterUserDto input) {
        Optional<Role> optionalRole = roleRepository.findByName(RoleEnum.ADMIN);

        if (optionalRole.isEmpty()) {
            return null;
        }

        var user = new User();
        user.setUserName(input.getUserName());
        user.setEmail(input.getEmail());
        user.setPassword(passwordEncoder.encode(input.getPassword()));
        Role role = findUserRole("ADMIN").get();
        user.setRole(role);

        return userRepository.save(user);
    }

    private boolean isAdminCreatingUser() {
        // Implement logic to check if the current logged-in user is an admin
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Check the roles (authorities) assigned to the user
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

        // Loop through authorities and check if 'ADMIN' role is present
        for (GrantedAuthority authority : authorities) {
            System.out.println(authority);
            if (authority.getAuthority().equals("ADMIN")) {
                return true;
            }
        }
        return false;
        // return true;
    }

    // user.setUserName(input.getUserName());
    public User authenticate(LoginUserDto input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getEmail(),
                        input.getPassword()));

        return userRepository.findByEmail(input.getEmail())
                .orElseThrow();
    }
}