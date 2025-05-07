package com.example.my_project;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DemoApplicationTests {

    @BeforeAll
    static void setup() {
        // Set default APP_NAME for testing if not already set
        if (System.getProperty("APP_NAME") == null && System.getenv("APP_NAME") == null) {
            System.setProperty("APP_NAME", "my-project-test");
        }
    }

    @Test
    void contextLoads() {
    }

}
