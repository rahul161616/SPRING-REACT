import React, { useState, useEffect } from 'react';
import '../styles/EventList.css';
import TaskModal from './TaskModal';
import EventModal from './EventModal';
import { eventService } from '../services/api';

function EventList() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchEvents = async () => {
        console.log('Fetching events...');
        try {
            const data = await eventService.getAll();
            console.log('Fetched events data:', data);
            setEvents(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setError(`Failed to load events: ${error.message}`);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // For debugging - log when component renders
    console.log('EventList rendering, events:', events);

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
    };

    const openAddTaskModal = () => {
        setIsAddingTask(true);
        setIsTaskModalOpen(true);
    };

    const closeTaskModal = () => {
        setIsTaskModalOpen(false);
    };

    const handleAddTask = async (taskData) => {
        try {
            const newTask = await eventService.addTask(selectedEvent.id, taskData);

            // Update the local state by adding the new task
            setSelectedEvent(prevEvent => {
                const updatedTasks = [...(prevEvent.tasks || []), newTask];
                return { ...prevEvent, tasks: updatedTasks };
            });

            // Also update the main events list
            setEvents(prevEvents => {
                return prevEvents.map(event => {
                    if (event.id === selectedEvent.id) {
                        const updatedTasks = [...(event.tasks || []), newTask];
                        return { ...event, tasks: updatedTasks };
                    }
                    return event;
                });
            });

            setIsTaskModalOpen(false);
            setIsAddingTask(false);
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task. Please try again.');
        }
    };

    const handleEditEvent = () => {
        setIsEditModalOpen(true);
        setIsModalOpen(false);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setIsModalOpen(true);
    };

    const handleUpdateEvent = async (updatedEventData) => {
        setIsSubmitting(true);
        try {
            // Create a properly formatted event object for the backend
            const formattedEventData = {
                ...updatedEventData,
                id: selectedEvent.id,
                eventDate: updatedEventData.date ? new Date(updatedEventData.date).toISOString() : null,
                dueDate: updatedEventData.dueDate ? new Date(updatedEventData.dueDate).toISOString() : null,
                tasks: selectedEvent.tasks || []
            };

            const updatedEvent = await eventService.update(selectedEvent.id, formattedEventData);

            // Update events list with the updated event
            setEvents(prevEvents =>
                prevEvents.map(event =>
                    event.id === selectedEvent.id ? updatedEvent : event
                )
            );

            setSelectedEvent(updatedEvent);
            setIsEditModalOpen(false);
            setIsModalOpen(true);
            alert("Event updated successfully!");
        } catch (error) {
            console.error('Error updating event:', error);
            alert(`Failed to update event: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleComplete = async () => {
        try {
            const newCompletedState = !selectedEvent.completed;
            await eventService.toggleComplete(selectedEvent.id, newCompletedState);

            // Update the selected event in the state
            setSelectedEvent({ ...selectedEvent, completed: newCompletedState });

            // Update the events list
            setEvents(prevEvents =>
                prevEvents.map(event =>
                    event.id === selectedEvent.id ? { ...event, completed: newCompletedState } : event
                )
            );

            const status = newCompletedState ? 'completed' : 'marked as pending';
            alert(`Event successfully ${status}!`);
        } catch (error) {
            console.error('Error toggling event completion status:', error);
            alert(`Failed to update event status: ${error.message}`);
        }
    };

    const handleDeleteEvent = async () => {
        if (!window.confirm('Are you sure you want to delete this event?')) {
            return;
        }

        try {
            await eventService.delete(selectedEvent.id);

            // Remove the event from the events list
            setEvents(prevEvents =>
                prevEvents.filter(event => event.id !== selectedEvent.id)
            );

            closeModal();
            alert('Event deleted successfully!');
        } catch (error) {
            console.error('Error deleting event:', error);
            alert(`Failed to delete event: ${error.message}`);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            await eventService.deleteTask(selectedEvent.id, taskId);

            // Update the selected event by removing the task
            setSelectedEvent(prev => ({
                ...prev,
                tasks: prev.tasks.filter(t => t.id !== taskId)
            }));

            // Also update the main events list
            setEvents(prevEvents =>
                prevEvents.map(event =>
                    event.id === selectedEvent.id
                        ? {
                            ...event,
                            tasks: event.tasks.filter(t => t.id !== taskId)
                        }
                        : event
                )
            );

        } catch (error) {
            console.error('Error deleting task:', error);
            alert(`Failed to delete task: ${error.message}`);
        }
    };

    const handleUpdateTask = async (task, index, isCompleted) => {
        try {
            const updatedTask = { ...task, completed: isCompleted };

            // Show visual feedback before the API call completes
            const updatedTasksPreview = [...selectedEvent.tasks];
            updatedTasksPreview[index] = {
                ...task,
                completed: isCompleted
            };

            setSelectedEvent(prev => ({
                ...prev,
                tasks: updatedTasksPreview
            }));

            // Update task in backend
            const updated = await eventService.updateTask(selectedEvent.id, task.id, updatedTask);

            // Update in the events list
            setEvents(prevEvents =>
                prevEvents.map(event =>
                    event.id === selectedEvent.id
                        ? {
                            ...event,
                            tasks: event.tasks.map(t =>
                                t.id === task.id ? updated : t
                            )
                        }
                        : event
                )
            );
        } catch (error) {
            console.error('Error updating task:', error);
            // Revert the preview change if the API call failed
            setSelectedEvent(prev => ({
                ...prev,
                tasks: prev.tasks.map(t =>
                    t.id === task.id ? task : t
                )
            }));
            alert('Failed to update task. Please try again.');
        }
    };

    if (isLoading) return <div className="events-loading">Loading events...</div>;
    if (error) return <div className="events-error">{error}</div>;
    if (events.length === 0) return <div className="events-empty">No events found. Create your first event!</div>;

    return (
        <div className="event-list-container">
            <h2>Your Events ({events.length})</h2>
            <div className="event-list">
                {events.map(event => (
                    <button
                        key={event.id}
                        className="event-card clickable"
                        onClick={() => handleEventClick(event)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleEventClick(event);
                            }
                        }}
                    >
                        <h3>{event.title}</h3>
                        <p className="event-description">{event.description}</p>
                        <div className="event-details">
                            <div className="event-detail">
                                <span className="detail-label">Date:</span>
                                <span>{event.eventDate ? new Date(event.eventDate).toLocaleString() : 'Not specified'}</span>
                            </div>
                            <div className="event-detail">
                                <span className="detail-label">Due Date:</span>
                                <span>{event.dueDate ? new Date(event.dueDate).toLocaleString() : 'Not specified'}</span>
                            </div>
                            <div className="event-detail">
                                <span className="detail-label">Location:</span>
                                <span>{event.location || 'Not specified'}</span>
                            </div>
                            <div className="event-detail">
                                <span className="detail-label">Type:</span>
                                <span>{event.type || 'Not specified'}</span>
                            </div>
                            <div className="event-detail">
                                <span className="detail-label">Priority:</span>
                                <span className={`priority-${event.priority || 'normal'}`}>
                                    {event.priority ? event.priority.charAt(0).toUpperCase() + event.priority.slice(1) : 'Normal'}
                                </span>
                            </div>
                            <div className="event-detail">
                                <span className="detail-label">Status:</span>
                                <span className={`status-${event.completed ? 'completed' : 'pending'}`}>
                                    {event.completed ? 'Completed' : 'Pending'}
                                </span>
                            </div>
                        </div>

                        {event.tasks && event.tasks.length > 0 && (
                            <div className="event-tasks">
                                <h4>Tasks ({event.tasks.length})</h4>
                                <ul>
                                    {event.tasks.map((task, index) => (
                                        <li
                                            key={task.id || index}
                                            className={`task-item ${task.completed ? 'task-completed' : 'task-pending'}`}
                                        >
                                            <div className="task-info">
                                                <span className={task.completed ? 'completed-task' : ''}>
                                                    {task.title}
                                                </span>
                                            </div>
                                            <div className="task-status">
                                                <span className={`status-badge ${task.completed ? 'status-completed' : 'status-pending'}`}>
                                                    {task.completed ? 'Completed' : 'Pending'}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {isModalOpen && selectedEvent && (
                <div
                    className="event-modal-overlay"
                    onClick={closeModal}
                    aria-modal="true"
                    role="dialog"
                    aria-label={`Details for ${selectedEvent.title}`}
                >
                    <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="event-modal-header">
                            <h2>{selectedEvent.title}</h2>
                            <button
                                className="event-modal-close"
                                onClick={closeModal}
                                aria-label="Close modal"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="event-modal-body">
                            <div className="event-modal-section">
                                <h3>Details</h3>
                                <p className="event-description">{selectedEvent.description || 'No description provided.'}</p>

                                <div className="event-modal-details">
                                    <div className="event-modal-detail">
                                        <span className="detail-label">Date:</span>
                                        <span>{selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleString() : 'Not specified'}</span>
                                    </div>
                                    <div className="event-modal-detail">
                                        <span className="detail-label">Due Date:</span>
                                        <span>{selectedEvent.dueDate ? new Date(selectedEvent.dueDate).toLocaleString() : 'Not specified'}</span>
                                    </div>
                                    <div className="event-modal-detail">
                                        <span className="detail-label">Location:</span>
                                        <span>{selectedEvent.location || 'Not specified'}</span>
                                    </div>
                                    <div className="event-modal-detail">
                                        <span className="detail-label">Type:</span>
                                        <span>{selectedEvent.type || 'Not specified'}</span>
                                    </div>
                                    <div className="event-modal-detail">
                                        <span className="detail-label">Priority:</span>
                                        <span className={`priority-${selectedEvent.priority || 'normal'}`}>
                                            {selectedEvent.priority ? selectedEvent.priority.charAt(0).toUpperCase() + selectedEvent.priority.slice(1) : 'Normal'}
                                        </span>
                                    </div>
                                    <div className="event-modal-detail">
                                        <span className="detail-label">Status:</span>
                                        <span className={`status-${selectedEvent.completed ? 'completed' : 'pending'}`}>
                                            {selectedEvent.completed ? 'Completed' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="event-modal-section">
                                <div className="task-section-header">
                                    <h3>Tasks</h3>
                                    <button
                                        className="add-task-button"
                                        onClick={openAddTaskModal}
                                    >
                                        + Add Task
                                    </button>
                                </div>
                                {selectedEvent.tasks && selectedEvent.tasks.length > 0 ? (
                                    <ul className="event-modal-tasks">
                                        {selectedEvent.tasks.map((task, index) => (
                                            <li
                                                key={task.id || index}
                                                className={`task-modal-item ${task.completed ? 'task-completed' : 'task-pending'}`}
                                            >
                                                <div className="task-content">
                                                    <span className={`task-name ${task.completed ? 'completed-task' : ''}`}>
                                                        {task.title}
                                                    </span>
                                                </div>
                                                <div className="task-action">
                                                    <select
                                                        className={`task-status-select ${task.completed ? 'completed' : 'pending'}`}
                                                        value={task.completed ? "completed" : "pending"}
                                                        onChange={async (e) => {
                                                            const isCompleted = e.target.value === "completed";
                                                            handleUpdateTask(task, index, isCompleted);
                                                        }}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="completed">Completed</option>
                                                    </select>
                                                    <button
                                                        className="delete-task-button"
                                                        onClick={() => handleDeleteTask(task.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-tasks-message">No tasks added yet</p>
                                )}
                            </div>

                            <div className="event-modal-actions">
                                <button
                                    className="action-button edit"
                                    onClick={handleEditEvent}
                                >
                                    Edit Event
                                </button>
                                <button
                                    className="action-button delete"
                                    onClick={handleDeleteEvent}
                                >
                                    Delete Event
                                </button>
                                <button
                                    className={`action-button ${selectedEvent.completed ? 'mark-incomplete' : 'mark-complete'}`}
                                    onClick={handleToggleComplete}
                                >
                                    {selectedEvent.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Task Modal */}
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={closeTaskModal}
                onSubmit={handleAddTask}
            />

            {/* Edit Event Modal */}
            {isEditModalOpen && selectedEvent && (
                <EventModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    onSubmit={handleUpdateEvent}
                    isSubmitting={isSubmitting}
                    initialValues={selectedEvent}
                    isEditing={true}
                />
            )}
        </div>
    );
}

export default EventList;