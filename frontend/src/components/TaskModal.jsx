// components/TaskModal.jsx
import React, { useState } from 'react';
import '../styles/Modal.css';

function TaskModal({ isOpen, onClose, onSubmit, isSubmitting = false, initialValues = null, isEditing = false }) {
    const [task, setTask] = useState({
        title: initialValues?.title || '',
        completed: initialValues?.completed || false
    });

    // Initialize with initial values if provided (for editing)
    React.useEffect(() => {
        if (initialValues) {
            setTask({
                title: initialValues.title || '',
                completed: initialValues.completed || false
            });
        }
    }, [initialValues]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTask(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStatusChange = (e) => {
        setTask(prev => ({
            ...prev,
            completed: e.target.value === "completed"
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(task);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isEditing ? 'Edit Task' : 'Add New Task'}</h2>
                    <button className="close-button" onClick={onClose} disabled={isSubmitting}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Title:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={task.title}
                            onChange={handleInputChange}
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status:</label>
                        <select
                            id="status"
                            name="status"
                            value={task.completed ? "completed" : "pending"}
                            onChange={handleStatusChange}
                            disabled={isSubmitting}
                            className={`task-status-select ${task.completed ? 'completed' : 'pending'}`}
                        >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div className="modal-buttons">
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isSubmitting}
                            style={{ opacity: isSubmitting ? 0.7 : 1 }}
                        >
                            {isSubmitting
                                ? (isEditing ? 'Updating...' : 'Creating...')
                                : (isEditing ? 'Update Task' : 'Create Task')}
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

export default TaskModal;