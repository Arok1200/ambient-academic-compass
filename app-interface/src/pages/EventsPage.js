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
import { FaTrash } from 'react-icons/fa'
import { FaPen } from 'react-icons/fa'

function EventsPage() {
  const { events, loading, loadData } = useData();

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);

  // Selected date
  const [selectedDate, setSelectedDate] = useState(new Date());
  const formattedSelectedDate = selectedDate.toISOString().slice(0, 10);

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
  const handleConfirmDelete = async (eventToDelete) => {
    try {
      await axios.delete(`${API_BASE_URL}/events/${eventToDelete.id}`);
      await loadData();
      setDeleteEvent(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete event.");
    }
  };

  // Filter events for the selected day (local time)
  const eventsForSelectedDay = events.filter((event) => {
    const eventDate = new Date(event.startTime);
    return (
      eventDate.getFullYear() === selectedDate.getFullYear() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getDate() === selectedDate.getDate()
    );
  });

  return (
    <div className="events-page-container">
      <DateNavigation
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {/* Events Table */}
      <div className="events-table">
        {loading && <p className="events-message">Loading events...</p>}

        {!loading && eventsForSelectedDay.length === 0 && (
          <p className="events-message">No events for this day.</p>
        )}

        {!loading &&
          eventsForSelectedDay.map((event) => (
            <div key={event.id} className="events-table-row">
              {/* Times */}
              <div className="events-table-cell times">
                {new Date(event.startTime).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
                -{" "}
                {new Date(event.endTime).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>

              {/* Title */}
              <div className="events-table-cell title">{event.title}</div>

              {/* Actions */}
              <div className="events-table-cell actions">
                <button onClick={() => setEditEvent(event)} title="Edit">
                  <FaPen size={18} color="#474747" />
                </button>
                <button onClick={() => setDeleteEvent(event)} title="Delete">
                  <FaTrash size={18} color="#474747"/>
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Add Event Button */}
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
          onConfirm={() => handleConfirmDelete(deleteEvent)}
        />
      )}
    </div>
  );
}

export default EventsPage;
