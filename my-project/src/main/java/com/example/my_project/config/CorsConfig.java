package com.example.my_project.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        // Allow the frontend URL from environment variable
        corsConfiguration.setAllowedOrigins(Arrays.asList(frontendUrl));
        // Allow localhost for development
        corsConfiguration.addAllowedOrigin("http://localhost:3000");
        corsConfiguration.addAllowedOrigin("http://127.0.0.1:3000");

        // Allow common HTTP methods
        corsConfiguration.setAllowedMethods(
                Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Allow all headers
        corsConfiguration.setAllowedHeaders(
                Arrays.asList("Authorization", "Content-Type", "X-Requested-With",
                        "Accept", "Origin", "Access-Control-Request-Method",
                        "Access-Control-Request-Headers"));

        // Allow cookies
        corsConfiguration.setAllowCredentials(true);

        // Expose the Authorization header
        corsConfiguration.setExposedHeaders(List.of("Authorization"));

        // How long the browser should cache the CORS response (in seconds)
        corsConfiguration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);

        return new CorsFilter(source);
    }
}
