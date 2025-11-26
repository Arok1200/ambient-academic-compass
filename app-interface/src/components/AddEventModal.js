import React, { useState } from "react";
import "./AddEventModal.css";

export default function AddEventModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [enableNotification, setEnableNotification] = useState(false);
  const [noticeMinutes, setNoticeMinutes] = useState(30);

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
      notificationEnabled: enableNotification,
      notificationMinutesBefore: enableNotification ? noticeMinutes : null,
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
            placeholder="Enter event title"
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

{/* Notification toggle — left aligned */}
        <div className="input-row stacked">
          <label className="modal-label">Reminder:</label>

          <div className="left-checkbox">
            <input
              type="checkbox"
              checked={enableNotification}
              onChange={(e) => setEnableNotification(e.target.checked)}
            />
            <span style={{ marginLeft: "10px" }}>
              Enable Notification Reminder
            </span>
          </div>
        </div>

        {/* Notification minutes selector */}
        {enableNotification && (
          <div className="input-row stacked">
            <label className="modal-label">Notify Before:</label>
            <select
              className="modal-input"
              value={noticeMinutes}
              onChange={(e) => setNoticeMinutes(parseInt(e.target.value))}
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>
        )}

        <div className="buttons">
            <button className="confirm" onClick={handleConfirm}>Confirm</button>
            <button className="cancel" onClick={onClose}>Cancel</button>
        </div>
        </div>
    </div>
  );
}
