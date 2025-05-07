// components/AddTaskButton.jsx
import React, { useState } from 'react';
import TaskModal from './TaskModal';

function AddTaskButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (taskData) => {
        console.log('Task created:', taskData);

        setIsSubmitting(true);
        try {
            setTimeout(() => {
                setIsSubmitting(false);
                setIsModalOpen(false);
            }, 500);
        } catch (error) {
            console.error('Error creating task:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                style={{
                    backgroundColor: 'var(--mainColor)',
                    color: 'var(--textColor)',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s ease'
                }}
                onClick={handleOpenModal}
                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--mainColorLight)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--mainColor)'}
            >
                + Add Task
            </button>

            <TaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </>
    );
}

export default AddTaskButton;