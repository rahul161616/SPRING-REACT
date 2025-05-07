// components/EventModal.jsx
import React, { useState, useEffect } from 'react';
import '../styles/Modal.css';

function EventModal({ isOpen, onClose, onSubmit, isSubmitting = false, initialValues = null, isEditing = false }) {
    const [event, setEvent] = useState({
        title: '',
        description: '',
        date: '',
        dueDate: '',
        location: '',
        type: '',
        priority: 'normal',
        tasks: []
    });

    // State for inline task editing - use title instead of name
    const [currentTask, setCurrentTask] = useState({
        title: '',
        completed: false
    });

    const [editingTaskIndex, setEditingTaskIndex] = useState(-1);
    const [isAddingTask, setIsAddingTask] = useState(false);

    // Initialize with initialValues when provided (for editing)
    useEffect(() => {
        if (initialValues) {
            // Format dates for datetime-local input
            const formatDateForInput = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
            };

            setEvent({
                ...initialValues,
                // Map eventDate to date for the form
                date: formatDateForInput(initialValues.eventDate),
                dueDate: formatDateForInput(initialValues.dueDate),
                tasks: initialValues.tasks || []
            });
        }
    }, [initialValues]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEvent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTaskInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentTask(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Ensure the tasks array is properly included when submitting
        onSubmit({
            ...event,
            // Preserve task IDs for existing tasks
            tasks: event.tasks.map(task => ({
                ...task,
                id: task.id || null // Keep ID if it exists, otherwise set to null for new tasks
            }))
        });
    };

    const startAddingTask = () => {
        setCurrentTask({
            title: '',
            completed: false
        });
        setIsAddingTask(true);
        setEditingTaskIndex(-1);
    };

    const startEditingTask = (index) => {
        const taskToEdit = event.tasks[index];
        setCurrentTask({
            title: taskToEdit.title || '',
            completed: taskToEdit.completed || false
        });
        setEditingTaskIndex(index);
        setIsAddingTask(true);
    };

    const cancelTaskEditing = () => {
        setIsAddingTask(false);
        setEditingTaskIndex(-1);
        setCurrentTask({
            title: '',
            completed: false
        });
    };

    const saveTask = () => {
        if (!currentTask.title.trim()) {
            alert("Task title cannot be empty");
            return;
        }

        if (editingTaskIndex >= 0) {
            // Update existing task
            const updatedTasks = [...event.tasks];
            updatedTasks[editingTaskIndex] = {
                ...updatedTasks[editingTaskIndex],
                title: currentTask.title,
                completed: currentTask.completed
            };
            setEvent(prev => ({
                ...prev,
                tasks: updatedTasks
            }));
        } else {
            // Add new task
            setEvent(prev => ({
                ...prev,
                tasks: [...prev.tasks, {
                    title: currentTask.title,
                    completed: currentTask.completed
                }]
            }));
        }

        // Reset the form
        setIsAddingTask(false);
        setEditingTaskIndex(-1);
        setCurrentTask({
            title: '',
            completed: false
        });
    };

    const handleRemoveTask = (index) => {
        setEvent(prev => ({
            ...prev,
            tasks: prev.tasks.filter((_, i) => i !== index)
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isEditing ? 'Edit Event' : 'Add New Event'}</h2>
                    <button className="close-button" onClick={onClose} disabled={isSubmitting}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Title:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={event.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={event.description}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="date">Date & Time:</label>
                        <input
                            type="datetime-local"
                            id="date"
                            name="date"
                            value={event.date}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="dueDate">Due Date:</label>
                        <input
                            type="datetime-local"
                            id="dueDate"
                            name="dueDate"
                            value={event.dueDate}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">Location:</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={event.location}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">Event Type:</label>
                        <select
                            id="type"
                            name="type"
                            value={event.type}
                            onChange={handleInputChange}
                        >
                            <option value="">Select a type</option>
                            <option value="meeting">Meeting</option>
                            <option value="social">Social</option>
                            <option value="work">Work</option>
                            <option value="personal">Personal</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="priority">Priority:</label>
                        <select
                            id="priority"
                            name="priority"
                            value={event.priority}
                            onChange={handleInputChange}
                        >
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="form-group tasks-section">
                        <div className="tasks-header">
                            <label>Tasks:</label>
                            {!isAddingTask && (
                                <button
                                    type="button"
                                    className="add-task-button"
                                    onClick={startAddingTask}
                                    disabled={isSubmitting}
                                >
                                    + Add Task
                                </button>
                            )}
                        </div>

                        {isAddingTask && (
                            <div className="inline-task-form">
                                <h4>{editingTaskIndex >= 0 ? 'Edit Task' : 'Add New Task'}</h4>
                                <div className="form-group">
                                    <label htmlFor="taskTitle">Task Title:</label>
                                    <input
                                        type="text"
                                        id="taskTitle"
                                        name="title"
                                        value={currentTask.title}
                                        onChange={handleTaskInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <label htmlFor="taskCompleted">
                                        <input
                                            type="checkbox"
                                            id="taskCompleted"
                                            name="completed"
                                            checked={currentTask.completed || false}
                                            onChange={handleTaskInputChange}
                                        />
                                        Completed
                                    </label>
                                </div>
                                <div className="task-form-buttons">
                                    <button
                                        type="button"
                                        className="save-task-button"
                                        onClick={saveTask}
                                    >
                                        {editingTaskIndex >= 0 ? 'Update Task' : 'Add Task'}
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-task-button"
                                        onClick={cancelTaskEditing}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isAddingTask && event.tasks.length > 0 && (
                            <div className="tasks-list">
                                {event.tasks.map((task, index) => (
                                    <div key={task.id || index} className="task-item">
                                        <div className="task-info">
                                            <label className="task-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={task.completed || false}
                                                    onChange={(e) => {
                                                        const updatedTasks = [...event.tasks];
                                                        updatedTasks[index] = {
                                                            ...updatedTasks[index],
                                                            completed: e.target.checked
                                                        };
                                                        setEvent(prev => ({
                                                            ...prev,
                                                            tasks: updatedTasks
                                                        }));
                                                    }}
                                                    className="task-checkbox"
                                                />
                                                <span className={`task-name ${task.completed ? 'completed-task' : ''}`}>
                                                    {task.title}
                                                </span>
                                            </label>
                                        </div>
                                        <div className="task-actions">
                                            <button
                                                type="button"
                                                onClick={() => startEditingTask(index)}
                                                className="edit-task-button"
                                                title="Edit task"
                                                disabled={isAddingTask}
                                            >
                                                ✎
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTask(index)}
                                                className="remove-task-button"
                                                title="Remove task"
                                                disabled={isAddingTask}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isAddingTask && event.tasks.length === 0 && (
                            <p className="no-tasks-message">No tasks added yet</p>
                        )}
                    </div>

                    <div className="modal-buttons">
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isSubmitting || isAddingTask}
                            style={{ opacity: (isSubmitting || isAddingTask) ? 0.7 : 1 }}
                        >
                            {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Event' : 'Create Event')}
                        </button>
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EventModal;