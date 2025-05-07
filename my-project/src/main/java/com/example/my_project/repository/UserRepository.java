package com.example.my_project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.my_project.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
   Optional<User> findByUsername(String username);
    // Add any custom query methods if needed

}
