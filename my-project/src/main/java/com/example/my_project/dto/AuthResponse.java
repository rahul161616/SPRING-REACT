package com.example.my_project.dto;

public class AuthResponse {

    // DTO for authentication response
    private final String token;

    public AuthResponse(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }
    //

}
