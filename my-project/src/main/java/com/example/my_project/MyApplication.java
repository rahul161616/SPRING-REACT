package com.example.my_project;

import java.io.File;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.my_project.config.ApplicationConfig;

import io.github.cdimascio.dotenv.Dotenv;

@RestController
@SpringBootApplication
@EnableConfigurationProperties(ApplicationConfig.class)
public class MyApplication {

    static {
        // Load environment variables from .env file before Spring initialization
        try {
            // Look for .env file in project root directory
            File envFile = new File(".env");
            String directory = System.getProperty("user.dir"); // Default to project root directory
            String filename = ".env";

            if (!envFile.exists()) {
                System.out.println("Warning: .env file not found in project root directory");
            } else {
                System.out.println("Found .env file at: " + envFile.getAbsolutePath());

                Dotenv dotenv = Dotenv.configure()
                        .directory(directory) // Use project root directory
                        .filename(filename)
                        .load();

                // Set environment variables for Spring to use
                dotenv.entries().forEach(e -> {
                    if (System.getProperty(e.getKey()) == null && System.getenv(e.getKey()) == null) {
                        System.setProperty(e.getKey(), e.getValue());
                        System.out.println("Loaded env variable: " + e.getKey());
                    }
                });
                System.out.println("Successfully loaded environment variables from .env file");
            }
        } catch (Exception e) {
            System.out.println("Warning: Could not load .env file: " + e.getMessage());
            e.printStackTrace();

            // Set default values for critical properties
            if (System.getProperty("frontend.url") == null && System.getenv("frontend.url") == null) {
                System.setProperty("frontend.url", "http://localhost:3000");
                System.out.println("Set default value for frontend.url: http://localhost:3000");
            }
        }
    }

    @RequestMapping("/")
    String home() {
        return "Hello World!";
    }

    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
