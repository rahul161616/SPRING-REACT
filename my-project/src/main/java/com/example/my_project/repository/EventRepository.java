package com.example.my_project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.my_project.model.Event;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByCompleted(boolean completed);

    List<Event> findByDueDateBefore(java.util.Date now); // For reminders

    List<Event> findByDueDateBeforeAndCompletedFalse(java.util.Date now); // For pending reminders

    List<Event> findByUserUsername(String username); // For user-specific events

    // Removed redundant findAll() declaration - this method is already provided by JpaRepository
}
