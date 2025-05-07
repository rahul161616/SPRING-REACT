package com.example.my_project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.my_project.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // Custom query methods can be defined here if needed
    // For example, to find tasks by their completion status or associated event
    List<Task> findByCompleted(boolean completed);

    List<Task> findByEventId(Long eventId); // Assuming you have an Event entity with an ID field
}
