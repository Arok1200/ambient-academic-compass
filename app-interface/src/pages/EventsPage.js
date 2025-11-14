import React from 'react';
import axios from 'axios';
import { useData } from '../context/DataContext';
import { API_BASE_URL } from '../services/api';
import DateNavigation from '../components/DateNavigation';
import AddButton from '../components/AddButton';

function EventsPage() {
  const { events, loading, loadData } = useData();

  const handleAddEvent = async () => {
    const title = prompt('Enter event title:');
    if (!title) return;
    
    const description = prompt('Enter event description (optional):');
    const startTime = prompt('Enter start time (YYYY-MM-DDTHH:MM:SS):');
    const endTime = prompt('Enter end time (YYYY-MM-DDTHH:MM:SS):');
    const location = prompt('Enter location (optional):');
    
    const newEvent = {
      title,
      description: description || '',
      startTime,
      endTime,
      location: location || '',
      completed: false
    };
    
    try {
      await axios.post(`${API_BASE_URL}/events`, newEvent);
      await loadData(); // Refresh the data from backend
      alert('Event added successfully!');
    } catch (error) {
      console.error('Failed to add event:', error);
      alert('Failed to add event. Please try again.');
    }
  };

  return (
    <div className="events-page-container">
      <DateNavigation />
      
      <div className="events-content">
        <div className="events-grid-container">
          {loading && <p className="events-message">Loading events...</p>}
          
          {!loading && events.length === 0 && (
            <p className="events-message">No events yet…</p>
          )}
          
          {!loading && events.length > 0 && (
            <div className="events-grid">
              {events.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-title">{event.title}</div>
                  {event.description && (
                    <p className="event-details">{event.description}</p>
                  )}
                  <div className="event-details">
                    <div>Start: {event.startTime}</div>
                    <div>End: {event.endTime}</div>
                    {event.location && <div>Location: {event.location}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <AddButton label="Add Event +" onClick={handleAddEvent} />
    </div>
  );
}

export default EventsPage;
