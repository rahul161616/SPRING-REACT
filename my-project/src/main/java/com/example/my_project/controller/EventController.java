package com.example.my_project.controller;

import com.example.my_project.model.Event;
import com.example.my_project.model.Task;
import com.example.my_project.repository.EventRepository;
import com.example.my_project.service.EventService;
import java.util.List;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = {"Authorization", "Content-Type"}, allowCredentials = "true")
public class EventController {

    private final EventService service;
    private final EventRepository repo;

    public EventController(EventService service, EventRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        Event savedEvent = service.addEvent(event); // ✅ Uses the service which handles task-event link
        return ResponseEntity.ok(savedEvent);
    }

    // Get all events
    @GetMapping
    public List<Event> getAllEvents() {
        // Since there's no direct User-Event relationship in the models,
        // we'll use the service's getAllEvents method instead
        return service.getEventsForCurrentUser();
    }

    // Get a specific event by ID
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Optional<Event> event = service.getEventById(id);
        return event.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Add a task to an event
    @PostMapping("/{eventId}/tasks")
    public ResponseEntity<Task> addTask(@PathVariable Long eventId, @RequestBody Task task) {
        return ResponseEntity.ok(service.addTaskToEvent(eventId, task));
    }

    // Get tasks for a specific event
    @GetMapping("/{eventId}/tasks")
    public List<Task> getTasksForEvent(@PathVariable Long eventId) {
        return service.getTasksForEvent(eventId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        service.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    // Delete a task from an event
    @DeleteMapping("/{eventId}/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long eventId, @PathVariable Long taskId) {
        service.deleteTaskFromEvent(eventId, taskId);
        return ResponseEntity.noContent().build();
    }

    // Update an event
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id,
            @RequestBody Event event) {
        Event updatedEvent = service.updateEvent(id, event);
        return ResponseEntity.ok(updatedEvent);
    }

    // Toggle event completion status
    @PutMapping("/{id}/complete")
    public ResponseEntity<Event> toggleEventCompletion(@PathVariable Long id, @RequestBody Event event) {
        Event updatedEvent = service.updateEventCompletion(id, event.isCompleted());
        return ResponseEntity.ok(updatedEvent);
    }

    // Update a task within an event
    @PutMapping("/{eventId}/tasks/{taskId}")
    public ResponseEntity<Task> updateTask(@PathVariable Long eventId, @PathVariable Long taskId, @RequestBody Task task) {
        Task updatedTask = service.updateTaskForEvent(eventId, taskId, task);
        return ResponseEntity.ok(updatedTask);
    }
}
