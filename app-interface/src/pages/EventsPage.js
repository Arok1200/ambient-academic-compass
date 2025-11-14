import React from 'react';
import axios from 'axios';
import { useData } from '../context/DataContext';
import { API_BASE_URL } from '../services/api';
import DateNavigation from '../components/DateNavigation';
import AddButton from '../components/AddButton';
import AddEventModal from '../components/AddEventModal';
import { useState } from 'react';

function EventsPage() {
  const { events, loading, loadData } = useData();

  const [showModal, setShowModal] = useState(false);

  const handleAddEvent = () => {
    setShowModal(true);
  };

  const handleSubmitEvent = async (newEvent) => {
    try {
      await axios.post(`${API_BASE_URL}/events`, newEvent);
      await loadData();
      alert("Event added!");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add event.");
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
      {showModal && (
        <AddEventModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitEvent}
        />
      )}
    </div>
  );
}

export default EventsPage;
