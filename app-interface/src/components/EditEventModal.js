import React, { useState } from "react";
import "./AddEventModal.css";

export default function EditEventModal({ event, onClose, onSubmit }) {

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const hrs = String(date.getHours()).padStart(2, "0");
    const mins = String(date.getMinutes()).padStart(2, "0");
    return `${hrs}:${mins}`;
  };

  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(event.startTime.split("T")[0]);
  const [startTime, setStartTime] = useState(formatTime(event.startTime));
  const [endTime, setEndTime] = useState(formatTime(event.endTime));

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
      completed: event.completed
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
