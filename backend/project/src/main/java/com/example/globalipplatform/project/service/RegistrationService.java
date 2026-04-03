package com.example.globalipplatform.project.service;

import com.example.globalipplatform.project.DTO.Role;
import com.example.globalipplatform.project.DTO.UserRequest;
import com.example.globalipplatform.project.DTO.UserResponse;
import com.example.globalipplatform.project.entity.User;
import com.example.globalipplatform.project.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegistrationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public RegistrationService(UserRepository userRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse register(UserRequest request) {

        String email = request.getEmail().toLowerCase().trim();
        if(userRepository.existsByEmail(email)){
            throw new RuntimeException("Email already exists");
        }

        User registerUser = new User();
        registerUser.setUsername(request.getUsername());
        registerUser.setEmail(email);
        registerUser.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Default to USER role if not specified
        String roleStr = request.getRole() != null ? request.getRole().toUpperCase() : "USER";
        registerUser.setRole(Role.valueOf(roleStr));

        User savedUser = userRepository.save(registerUser);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );
    }
}