import React from "react";
import "./AddEventModal.css";

export default function DeleteEventModal({ event, onClose, onConfirm }) {
  return (
    <div className="event-modal-overlay">
      <div className="event-modal">
        <h2>Delete Event</h2>
        <p>Are you sure you want to delete "{event.title}"?</p>
        <div className="buttons">
          <button className="confirm" onClick={onConfirm}>Yes</button>
          <button className="cancel" onClick={onClose}>No</button>
        </div>
      </div>
    </div>
  );
}
