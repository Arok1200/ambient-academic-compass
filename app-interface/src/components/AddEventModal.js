import React, { useState } from "react";
import "./AddEventModal.css";

export default function AddEventModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleConfirm = () => {
    if (!title || !date || !startTime || !endTime) {
      alert("Please fill out all required fields.");
      return;
    }

    const newEvent = {
      title,
      startTime: `${date}T${startTime}:00`,
      endTime: `${date}T${endTime}:00`,
      completed: false,
    };

    onSubmit(newEvent);
  };

  return (
    <div className="event-modal-overlay">
      <div className="event-modal">
        <h2>Add New Event</h2>

        <div className="input-row">
            <label>Title:</label>
            <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            />
        </div>

        <div className="input-row">
            <label>Date:</label>
            <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            />
        </div>

        <div className="input-row">
            <label>Start Time:</label>
            <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            />
        </div>

        <div className="input-row">
            <label>End Time:</label>
            <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            />
        </div>

        <div className="buttons">
            <button className="confirm" onClick={handleConfirm}>Confirm</button>
            <button className="cancel" onClick={onClose}>Cancel</button>
        </div>
        </div>
    </div>
  );
}
