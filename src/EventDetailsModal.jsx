import React from 'react';
import './EventDetailsModal.css';

const EventDetailsModal = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>✖️</button>
        <h2>Event Details</h2>
        <p><strong>Date:</strong> {event.date}</p>
        <p><strong>Event:</strong> {event.event}</p>
        <p><strong>Category:</strong> {event.category}</p>
        {/* Add more fields as needed */}
      </div>
    </div>
  );
};

export default EventDetailsModal;
