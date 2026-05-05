package com.internship.tool.controller;

import com.internship.tool.config.JwtUtil;
import com.internship.tool.entity.User;
import com.internship.tool.repository.UserRepository;
import com.internship.tool.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.HashMap;
import java.util.Map;

@Tag(name = "Authentication API", description = "User registration and login")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final UserRepository repository;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService,
                          UserRepository repository,
                          PasswordEncoder encoder,
                          JwtUtil jwtUtil) {
        this.userService = userService;
        this.repository = repository;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    // ✅ REGISTER
    @Operation(summary = "Register new user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody User user) {

        userService.register(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully");

        return ResponseEntity.ok(response);
    }

    // ✅ LOGIN
    @Operation(summary = "Login and get JWT token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody User user) {

        User existing = repository.findByUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(user.getPassword(), existing.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getUsername());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("username", existing.getUsername());

        return ResponseEntity.ok(response);
    }
}