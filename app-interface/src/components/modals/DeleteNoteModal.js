import React from "react";
import "../AddEventModal.css";

export default function DeleteNoteModal({ note, onClose, onConfirm }) {
  if (!note) return null; 

  return (
    <div className="event-modal-overlay">
      <div className="event-modal">
        <h2>Delete Note</h2>
        <p>Are you sure you want to delete this note?</p>
        <div className="buttons">
          <button className="confirm" onClick={onConfirm}>Yes</button>
          <button className="cancel" onClick={onClose}>No</button>
        </div>
      </div>
    </div>
  );
}