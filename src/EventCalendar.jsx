import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './EventCalendar.css';
import EventShowcase from './EventShowcase';

// API URL
const API_URL = 'https://caaaddd67da845d73791.free.beeceptor.com/api/calendar/events/';

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
            event: eventInput.trim()
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
                {(events[dateKey] || []).map((event) => (
                  <div key={event.id} className="event-item">
                    {event.event}
                    <button className="delete-button" onClick={() => deleteEvent(dateKey, event.id)}>✖️</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="event-addition">
        <h2>Add Event</h2>
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
        <button onClick={addEvent} className="add-button">Add Event</button>
        {error && <p className="error-message">{error}</p>}
      </div>

      {loading ? <p>Loading events...</p> : <EventShowcase events={events} />}
    </div>
  );
};

export default EventCalendar;
