package com.xeno.shopify.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.xeno.shopify.dto.AuthRequest;
import com.xeno.shopify.dto.AuthResponse;
import com.xeno.shopify.dto.RegisterRequest;
import com.xeno.shopify.model.Tenant;
import com.xeno.shopify.model.User;
import com.xeno.shopify.repository.TenantRepository;
import com.xeno.shopify.repository.UserRepository;
import com.xeno.shopify.service.JwtService;

import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            String token = jwtService.generateToken(user.getEmail(), user.getTenantId());

            AuthResponse response = new AuthResponse();
            response.setToken(token);
            response.setEmail(user.getEmail());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            response.setTenantId(user.getTenantId());
            response.setRole(user.getRole().name());
            response.setSuccess(true);
            response.setMessage("Login successful");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            // Check if user already exists
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("User already exists with this email");
            }

            // Create or find tenant
            Tenant tenant;
            if (request.getTenantId() != null && !request.getTenantId().isEmpty()) {
                tenant = tenantRepository.findByTenantId(request.getTenantId())
                    .orElseThrow(() -> new RuntimeException("Tenant not found"));
            } else {
                // Create new tenant
                String tenantId = "tenant_" + UUID.randomUUID().toString().substring(0, 8);
                tenant = new Tenant(tenantId, request.getStoreName(), request.getShopDomain());
                tenant = tenantRepository.save(tenant);
            }

            // Create user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setTenantId(tenant.getTenantId());
            user.setRole(User.Role.USER);

            user = userRepository.save(user);

            // Generate token
            String token = jwtService.generateToken(user.getEmail(), user.getTenantId());

            AuthResponse response = new AuthResponse();
            response.setToken(token);
            response.setEmail(user.getEmail());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            response.setTenantId(user.getTenantId());
            response.setRole(user.getRole().name());
            response.setSuccess(true);
            response.setMessage("Registration successful");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7); // Remove "Bearer " prefix
            String email = jwtService.extractEmail(jwt);
            
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            if (jwtService.validateToken(jwt, email)) {
                String newToken = jwtService.generateToken(user.getEmail(), user.getTenantId());
                
                AuthResponse response = new AuthResponse();
                response.setToken(newToken);
                response.setEmail(user.getEmail());
                response.setFirstName(user.getFirstName());
                response.setLastName(user.getLastName());
                response.setTenantId(user.getTenantId());
                response.setRole(user.getRole().name());
                response.setSuccess(true);
                response.setMessage("Token refresh successful");

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("Invalid token");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Token refresh failed");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7); // Remove "Bearer " prefix
            String email = jwtService.extractEmail(jwt);
            
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            AuthResponse response = new AuthResponse();
            response.setEmail(user.getEmail());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            response.setTenantId(user.getTenantId());
            response.setRole(user.getRole().name());
            response.setSuccess(true);
            response.setMessage("User info retrieved successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get user info");
        }
    }

    // Temporary utility endpoint to generate correct password hash
    @GetMapping("/hash-password")
    public ResponseEntity<String> hashPassword(@RequestParam String password) {
        String hashedPassword = passwordEncoder.encode(password);
        return ResponseEntity.ok(hashedPassword);
    }
}
