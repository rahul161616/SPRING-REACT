package com.example.my_project.controller;

import com.example.my_project.dto.AuthRequest;
import com.example.my_project.dto.AuthResponse;
import com.example.my_project.model.User;
import com.example.my_project.service.CustomUserDetailsService;
import com.example.my_project.service.JWTService;
import com.example.my_project.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = {"Authorization", "Content-Type"}, allowCredentials = "true")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserService userService;
    private final JWTService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public AuthController(AuthenticationManager authManager, UserService userService, JWTService jwtService,
            CustomUserDetailsService userDetailsService) {
        this.authManager = authManager;
        this.userService = userService;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
            String jwt = jwtService.generateToken(userDetails);

            return ResponseEntity.ok(new AuthResponse(jwt));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse("Invalid credentials"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody User user) {
        try {
            // Register the user first
            User registeredUser = userService.registerUser(user);

            // Then load the proper UserDetails object for token generation
            UserDetails userDetails = userDetailsService.loadUserByUsername(registeredUser.getUsername());
            String jwt = jwtService.generateToken(userDetails);

            return ResponseEntity.ok(new AuthResponse(jwt));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponse("Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // Invalidate the JWT token or perform any other logout logic here
        //using JWT doesnot do anything on server side, just remove the token from client side
        // For example, you might want to blacklist the token or set it to expire immediately
        // This is a no-op in stateless JWT authentication, but you can implement it if needed
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(HttpServletRequest request) {
        // Extract token from Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("Invalid token format or missing Authorization header");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse("Invalid token format"));
        }

        String token = authHeader.substring(7);
        System.out.println("Validating token: " + token.substring(0, Math.min(10, token.length())) + "...");

        try {
            // Verify the token and extract username
            String username = jwtService.extractUsername(token);
            System.out.println("Extracted username from token: " + username);

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(token, userDetails)) {
                System.out.println("Token is valid for user: " + username);
                // Token is valid, return user info
                User user = userService.findByUsername(username);

                // Create a response with user data
                Map<String, Object> userData = new HashMap<>();
                userData.put("username", user.getUsername());
                userData.put("id", user.getId());
                // Add other user details as needed

                return ResponseEntity.ok(userData);
            } else {
                System.out.println("Token validation failed for username: " + username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse("Invalid token"));
            }
        } catch (Exception e) {
            // Token validation failed
            System.out.println("Exception during token validation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse("Invalid token"));
        }
    }

}
