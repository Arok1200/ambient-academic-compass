import React, { useState } from "react";
import "./AddEventModal.css";

export default function EditEventModal({ event, onClose, onSubmit }) {
  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(event.startTime.split("T")[0]);
  const [startTime, setStartTime] = useState(event.startTime.split("T")[1].slice(0,5));
  const [endTime, setEndTime] = useState(event.endTime.split("T")[1].slice(0,5));

  const handleConfirm = () => {
    if (!title || !date || !startTime || !endTime) {
      alert("Please fill all fields.");
      return;
    }
    const updatedEvent = {
      id: event.id,
      title,
      startTime: `${date}T${startTime}:00`,
      endTime: `${date}T${endTime}:00`,
      completed: event.completed,
    };
    onSubmit(updatedEvent);
  };

  return (
    <div className="event-modal-overlay">
      <div className="event-modal">
        <h2>Edit Event</h2>

        <div className="input-row stacked">
          <label>Title:</label>
          <input value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div className="input-row stacked">
          <label>Date:</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div className="input-row stacked">
          <label>Start Time:</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>

        <div className="input-row stacked">
          <label>End Time:</label>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>

        <div className="buttons">
          <button className="confirm" onClick={handleConfirm}>Confirm</button>
          <button className="cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
