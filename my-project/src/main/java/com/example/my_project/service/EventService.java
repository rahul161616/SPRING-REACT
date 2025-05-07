package com.example.my_project.service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.my_project.model.Event;
import com.example.my_project.model.Task;
import com.example.my_project.model.User;
import com.example.my_project.repository.EventRepository;
import com.example.my_project.repository.TaskRepository;
import com.example.my_project.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final TaskRepository taskRepo;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository, TaskRepository taskRepo, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.taskRepo = taskRepo;
        this.userRepository = userRepository;
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    //add events
    public Event addEvent(Event event) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        event.setUser(user);

        if (event.getTasks() != null) {
            for (Task task : event.getTasks()) {
                task.setEvent(event);
            }
        }
        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    public List<Event> getEventsForCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return eventRepository.findByUserUsername(username);
    }

    public List<Event> getPendingReminders() {
        // Find events where the due date has passed but the event is not marked as completed
        return eventRepository.findByDueDateBeforeAndCompletedFalse(new Date());
    }

    public Event markAsCompleted(Long id) {
        Event event = eventRepository.findById(id).orElseThrow();
        event.setCompleted(true);
        return eventRepository.save(event);
    }

    // Get a specific event by ID
    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }
    // Add a new task to an event

    @Transactional
    public Task addTaskToEvent(Long eventId, Task task) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        if (task == null) {
            throw new IllegalArgumentException("Task cannot be null");
        }

        task.setEvent(event);
        event.getTasks().add(task);  // Update both sides of bidirectional relationship
        return taskRepo.save(task);
    }

    // Delete a task from an event
    public void deleteTaskFromEvent(Long eventId, Long taskId) {
        taskRepo.deleteById(taskId);
    }

    // Get tasks for a specific event
    public List<Task> getTasksForEvent(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        return event.getTasks();
    }

    @Transactional
    public Event updateEvent(Long eventId, Event updatedEvent) {
        Event existingEvent = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        // Update basic event details
        existingEvent.setTitle(updatedEvent.getTitle());
        existingEvent.setDescription(updatedEvent.getDescription());
        existingEvent.setDueDate(updatedEvent.getDueDate());
        existingEvent.setCompleted(updatedEvent.isCompleted());
        existingEvent.setEventDate(updatedEvent.getEventDate());
        existingEvent.setLocation(updatedEvent.getLocation());
        existingEvent.setType(updatedEvent.getType());
        existingEvent.setPriority(updatedEvent.getPriority());

        // Handle task updates if they're provided
        if (updatedEvent.getTasks() != null) {
            // Create a map of existing tasks by ID for easy lookup
            Map<Long, Task> existingTasksMap = existingEvent.getTasks().stream()
                    .collect(Collectors.toMap(Task::getId, task -> task, (a, b) -> a));

            // Process each task from the updated event
            List<Task> updatedTasks = new ArrayList<>();
            for (Task updatedTask : updatedEvent.getTasks()) {
                if (updatedTask.getId() != null && existingTasksMap.containsKey(updatedTask.getId())) {
                    // Update existing task - only name and completed status
                    Task existingTask = existingTasksMap.get(updatedTask.getId());
                    if (updatedTask.getTitle() != null) {
                        existingTask.setTitle(updatedTask.getTitle());
                    }
                    existingTask.setCompleted(updatedTask.isCompleted());

                    updatedTasks.add(existingTask);
                    existingTasksMap.remove(updatedTask.getId());
                } else {
                    // Add new task - only with name and completed status
                    Task newTask = new Task();
                    newTask.setTitle(updatedTask.getTitle());
                    newTask.setCompleted(updatedTask.isCompleted());
                    newTask.setEvent(existingEvent);

                    updatedTasks.add(newTask);
                }
            }

            // Any tasks left in existingTasksMap were not present in the updated tasks list, so they should be removed
            taskRepo.deleteAll(existingTasksMap.values());

            // Replace the tasks in the existing event with the updated task list
            existingEvent.getTasks().clear();
            existingEvent.getTasks().addAll(updatedTasks);
            for (Task task : updatedTasks) {
                if (task.getId() == null) {
                    taskRepo.save(task);
                }
            }
        }

        // Save and return the updated event
        return eventRepository.save(existingEvent);
    }

    /**
     * Updates just the completion status of an event
     *
     * @param eventId The ID of the event to update
     * @param completed The new completion status
     * @return The updated event
     */
    public Event updateEventCompletion(Long eventId, boolean completed) {
        Event existingEvent = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        existingEvent.setCompleted(completed);

        return eventRepository.save(existingEvent);
    }

    /**
     * Updates a task for a specific event
     *
     * @param eventId The ID of the event containing the task
     * @param taskId The ID of the task to update
     * @param updatedTask The updated task data
     * @return The updated task
     */
    @Transactional
    public Task updateTaskForEvent(Long eventId, Long taskId, Task updatedTask) {
        // Verify the event exists
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        // Find the task within the event
        Task existingTask = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        // Verify the task belongs to this event - with null checks
        if (existingTask.getEvent() == null) {
            // If task has no event association, set it now
            existingTask.setEvent(event);
        } else if (!eventId.equals(existingTask.getEvent().getId())) {
            throw new RuntimeException("Task with id " + taskId + " does not belong to event with id " + eventId);
        }

        // Update task fields (only title and completed status)
        if (updatedTask.getTitle() != null && !updatedTask.getTitle().isEmpty()) {
            existingTask.setTitle(updatedTask.getTitle());
        }
        existingTask.setCompleted(updatedTask.isCompleted());

        // Save and return the updated task
        return taskRepo.save(existingTask);
    }
}
