import React, { useState } from 'react';
import axios from 'axios';
import { useData } from '../context/DataContext';
import { API_BASE_URL } from '../services/api';
import DateNavigation from '../components/DateNavigation';
import AddButton from '../components/AddButton';
import { EventModal } from '../components/modals';

function EventsPage() {
  const { events, loading, loadData } = useData();
  const [showModal, setShowModal] = useState(false);

  const handleSubmitEvent = async (formData) => {
    const startTime = `${formData.eventDate}T${formData.startTime}:00`;
    const endTime = `${formData.eventDate}T${formData.endTime}:00`;
    
    const newEvent = {
      title: formData.title,
      description: '',
      startTime,
      endTime,
      location: '',
      completed: false
    };
    
    try {
      await axios.post(`${API_BASE_URL}/events`, newEvent);
      await loadData();
      alert('Event added successfully!');
    } catch (error) {
      console.error('Failed to add event:', error);
      alert('Failed to add event. Please check the date/time format and try again.');
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
      
      <AddButton label="Add Event +" onClick={() => setShowModal(true)} />

      <EventModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitEvent}
      />
    </div>
  );
}

export default EventsPage;
