// components/AddEventButton.jsx
import React, { useState } from 'react';
import '../styles/AddEventButton.css';
import EventModal from './EventModal';
import { useNavigate } from 'react-router-dom';


function AddEventButton() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (eventData) => {
        console.log('Event data before formatting:', eventData);

        // Transform date strings to match backend expectations
        const formattedEventData = {
            ...eventData,
            eventDate: eventData.date ? new Date(eventData.date).toISOString() : null,
            dueDate: eventData.dueDate ? new Date(eventData.dueDate).toISOString() : null
        };

        console.log('Formatted event data being sent to backend:', formattedEventData);

        setIsSubmitting(true);
        try {
            // Send the event data to the backend
            const response = await fetch('http://localhost:8080/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formattedEventData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Event created successfully, server response:', data);

            // Show a temporary success message (you could implement a toast notification here)
            alert('Event created successfully!');

            // Refresh the page to show the new event
            window.location.reload();
        } catch (error) {
            console.error('Error creating event:', error);
            alert(`Failed to create event: ${error.message}`);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                className="add-event-button"
                onClick={handleOpenModal}
                style={{
                    backgroundColor: 'var(--mainColor)',
                    color: 'var(--textColor)'
                }}
            >
                + Add Event
            </button>

            <EventModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </>
    );
}

export default AddEventButton;