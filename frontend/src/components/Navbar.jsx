import React, { useState, useEffect, useRef } from 'react';
import { FaBars, FaTimes, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import PropTypes from 'prop-types';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/events', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  // Single toggle function for sidebar
  const handleToggle = () => {
    toggleSidebar();
  };

  // Toggle for responsive nav menu
  const toggleNav = () => {
    setIsNavOpen((prev) => !prev);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-icon" onClick={handleToggle}>
          <FaBars />
        </button>
        <button
          className="logo"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
          aria-label="Navigate to home"
        >
          Logo
        </button>
      </div>

      {/* <nav ref={navRef} className={isNavOpen ? 'responsive_nav' : ''}>
        {events.map((event) => (
          <a
            key={event.id}
            href={`/events/${event.id}`}
            onClick={(e) => {
              e.preventDefault();
              handleEventClick(event);
            }}
          >
            {event.title}
          </a>
        ))}
        <button className="nav-btn nav-close-btn" onClick={toggleNav}>
          <FaTimes />
        </button>
      </nav> */}

      <div className="navbar-right">
        <a href="/notifications" className="notification-icon">
          <FaBell />
        </a>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>
              &times;
            </button>
            <h3>Event Details</h3>
            {selectedEvent && (
              <div>
                <p><strong>Title:</strong> {selectedEvent.title}</p>
                <p><strong>Description:</strong> {selectedEvent.description || 'N/A'}</p>
                <p><strong>Date:</strong> {selectedEvent.eventDate ? new Date(selectedEvent.eventDate).toLocaleString() : 'N/A'}</p>
                <p><strong>Due Date:</strong> {selectedEvent.dueDate ? new Date(selectedEvent.dueDate).toLocaleString() : 'N/A'}</p>
                <p><strong>Location:</strong> {selectedEvent.location || 'N/A'}</p>
                <p><strong>Type:</strong> {selectedEvent.type || 'N/A'}</p>
                <p><strong>Priority:</strong> {selectedEvent.priority || 'Normal'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
Navbar.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
};

export default Navbar;
