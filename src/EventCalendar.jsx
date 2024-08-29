import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './EventCalendar.css';
import EventShowcase from './EventShowcase';
import EventDetailsModal from './EventDetailsModal';

// API URL
const API_URL = 'https://ca3c3b841ea75daa1fa7.free.beeceptor.com/api/calender/events/';

const generateDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EventCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [eventInput, setEventInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState('All');
  const [editingEvent, setEditingEvent] = useState(null);

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();
  const selectedDay = selectedDate.getDate();
  const daysInMonth = generateDaysInMonth(selectedYear, selectedMonth);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      
      const formattedEvents = data.reduce((acc, event) => {
        const dateKey = event.date;
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(event);
        return acc;
      }, {});
      
      setEvents(formattedEvents);
    } catch (error) {
      setError('Error fetching events');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async () => {
    if (eventInput.trim()) {
      const dateKey = `${selectedYear}-${selectedMonth + 1}-${selectedDay}`;
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            date: dateKey,
            event: eventInput.trim(),
            category: 'Work' // Example category
          })
        });

        if (!response.ok) throw new Error('Failed to add event');

        const newEvent = await response.json();
        setEvents(prevEvents => ({
          ...prevEvents,
          [dateKey]: [...(prevEvents[dateKey] || []), newEvent],
        }));
        setEventInput('');
      } catch (error) {
        setError('Error adding event');
        console.error('Error adding event:', error);
      }
    }
  };

  const deleteEvent = async (dateKey, eventId) => {
    try {
      const response = await fetch(`${API_URL}/${eventId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete event');

      setEvents(prevEvents => {
        const updatedEvents = prevEvents[dateKey].filter(event => event.id !== eventId);
        return {
          ...prevEvents,
          [dateKey]: updatedEvents.length ? updatedEvents : undefined,
        };
      });
    } catch (error) {
      setError('Error deleting event');
      console.error('Error deleting event:', error);
    }
  };

  const editEvent = async (event) => {
    setEditingEvent(event);
    setEventInput(event.event); // Pre-fill the input with the existing event details
  };

  const saveEditedEvent = async () => {
    if (editingEvent && eventInput.trim()) {
      const dateKey = editingEvent.date;
      try {
        const response = await fetch(`${API_URL}/${editingEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...editingEvent,
            event: eventInput.trim()
          })
        });

        if (!response.ok) throw new Error('Failed to edit event');

        const updatedEvent = await response.json();
        setEvents(prevEvents => ({
          ...prevEvents,
          [dateKey]: prevEvents[dateKey].map(evt => evt.id === updatedEvent.id ? updatedEvent : evt),
        }));
        setEditingEvent(null);
        setEventInput('');
      } catch (error) {
        setError('Error editing event');
        console.error('Error editing event:', error);
      }
    }
  };

  const filterEvents = (events, filter) => {
    if (filter === 'All') return events;
    return events.filter(event => event.category === filter);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="nav-button" onClick={() => setSelectedDate(new Date(selectedYear - 1, selectedMonth))}>←</button>
        <h1 className="calendar-title">{selectedYear}</h1>
        <button className="nav-button" onClick={() => setSelectedDate(new Date(selectedYear + 1, selectedMonth))}>→</button>
      </div>
      <div className="calendar-header">
        <button className="nav-button" onClick={() => setSelectedDate(new Date(selectedYear, selectedMonth - 1))}>←</button>
        <h2 className="calendar-month">{months[selectedMonth]}</h2>
        <button className="nav-button" onClick={() => setSelectedDate(new Date(selectedYear, selectedMonth + 1))}>→</button>
      </div>
      <div>
        <select onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
        </select>
      </div>
      <div className="calendar-grid">
        {[...Array(daysInMonth).keys()].map((i) => {
          const day = i + 1;
          const dateKey = `${selectedYear}-${selectedMonth + 1}-${day}`;
          return (
            <div
              key={day}
              className="calendar-cell"
              onClick={() => setSelectedDate(new Date(selectedYear, selectedMonth, day))}
            >
              <div className="day-number">{day}</div>
              <div className="events-list">
                {filterEvents(events[dateKey] || [], filter).map((event) => (
                  <div key={event.id} className="event-item">
                    <span onClick={() => setSelectedEvent(event)}>{event.event}</span>
                    <button className="delete-button" onClick={() => deleteEvent(dateKey, event.id)}>✖️</button>
                    <button className="edit-button" onClick={() => editEvent(event)}>✏️</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="event-addition">
        <h2>{editingEvent ? 'Edit Event' : 'Add Event'}</h2>
        <DatePicker
          selected={selectedDate}
          onChange={date => setSelectedDate(date)}
          dateFormat="MMMM d, yyyy"
          className="date-picker"
        />
        <input
          type="text"
          value={eventInput}
          onChange={(e) => setEventInput(e.target.value)}
          placeholder="Enter event"
          className="event-input"
        />
        {editingEvent ? (
          <button onClick={saveEditedEvent} className="save-button">Save Changes</button>
        ) : (
          <button onClick={addEvent} className="add-button">Add Event</button>
        )}
        {error && <p className="error-message">{error}</p>}
      </div>

      {loading ? <p>Loading events...</p> : <EventShowcase events={events} />}

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default EventCalendar;
