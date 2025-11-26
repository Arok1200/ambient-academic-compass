import React, { useState } from "react";
import axios from "axios";
import { useData } from "../context/DataContext";
import { API_BASE_URL } from "../services/api";
import DateNavigation from "../components/DateNavigation";
import AddButton from "../components/AddButton";
import AddEventModal from "../components/AddEventModal";
import EditEventModal from "../components/EditEventModal";
import DeleteEventModal from "../components/DeleteEventModal";
import "./EventsPage.css";

// Edit pencil
const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// Trash can
const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function EventsPage() {
  const { events, loading, loadData } = useData();

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [showAddModal, setShowAddModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);

  // Add event
  const handleSubmitEvent = async (newEvent) => {
    try {
      await axios.post(`${API_BASE_URL}/events`, newEvent);
      await loadData();
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add event.");
    }
  };

  // Edit event
  const handleUpdateEvent = async (updatedEvent) => {
    try {
      await axios.put(`${API_BASE_URL}/events/${updatedEvent.id}`, updatedEvent);
      await loadData();
      setEditEvent(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update event.");
    }
  };

  // Delete event
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/events/${deleteEvent.id}`);
      await loadData();
      setDeleteEvent(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete event.");
    }
  };

  // Filter events by selected date
  const eventsForSelectedDay = events.filter((event) => {
    const eventDate = new Date(event.startTime);
    return (
      eventDate.getFullYear() === selectedDate.getFullYear() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getDate() === selectedDate.getDate()
    );
  });

  // Format date/time text
  const formatDateTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    return (
      `${start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} — ` +
      `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })} ` +
      `to ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}`
    );
  };

  return (
    <div className="events-page-container">
      {/* Top navigation */}
      <DateNavigation selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      {/* Events list */}
      <div className="events-list">
        {loading && <p className="events-message">Loading events...</p>}

        {!loading && eventsForSelectedDay.length === 0 && (
          <p className="events-message">No events for this day.</p>
        )}

        {!loading &&
          eventsForSelectedDay.map((event) => (
            <div key={event.id} className="deadlines-content">
              <div className="deadlines-list-bordered">
                <div className="event-row">
                  <div className="event-info">
                    <div className="event-title">{event.title}</div>
                    <div className="event-datetime">
                      {formatDateTime(event.startTime, event.endTime)}
                    </div>
                  </div>

                  <div className="event-actions">
                    <button
                      onClick={() => setEditEvent(event)}
                      className="deadline-icon-btn"
                    >
                      <EditIcon />
                    </button>

                    <button
                      onClick={() => setDeleteEvent(event)}
                      className="deadline-icon-btn"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Add event button */}
      <AddButton label="Add Event +" onClick={() => setShowAddModal(true)} />

      {/* Modals */}
      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleSubmitEvent}
        />
      )}

      {editEvent && (
        <EditEventModal
          event={editEvent}
          onClose={() => setEditEvent(null)}
          onSubmit={handleUpdateEvent}
        />
      )}

      {deleteEvent && (
        <DeleteEventModal
          event={deleteEvent}
          onClose={() => setDeleteEvent(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
