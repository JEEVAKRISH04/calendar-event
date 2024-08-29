import React from 'react';
import './EventShowcase.css';

const EventShowcase = ({ events }) => {
  // Ensure events is defined and is an object
  if (!events || typeof events !== 'object') {
    return <p>No events available</p>;
  }

  // Get the current date to show events for today if applicable
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  // Get events for today
  const todaysEvents = events[todayKey] || [];

  return (
    <div className="event-showcase">
      <h2>Today's Events</h2>
      {todaysEvents.length > 0 ? (
        <ul>
          {todaysEvents.map((event, index) => (
            <li key={event.id || index}>{event.event || event}</li>
          ))}
        </ul>
      ) : (
        <p>No events for today.</p>
      )}
    </div>
  );
};

export default EventShowcase;