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
  const [enableNotification, setEnableNotification] = useState(
    event.notificationEnabled || false
  );
  const [noticeMinutes, setNoticeMinutes] = useState(
    event.notificationMinutesBefore || 30
  );

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
      notificationEnabled: enableNotification,
      notificationMinutesBefore: enableNotification ? noticeMinutes : null,
    };

    onSubmit(updatedEvent);
  };

  const handleDismissNotification = () => {
    const updatedEvent = {
      ...event,
      notificationEnabled: false,
      notificationMinutesBefore: null,
    };
    onSubmit(updatedEvent);
  };

  return (
    <div className="event-modal-overlay">
      <div className="event-modal">
        <h2>Edit Event</h2>

        {/* Title */}
        <div className="input-row stacked">
          <label className="modal-label">Title:</label>
          <input
            className="modal-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Date */}
        <div className="input-row stacked">
          <label className="modal-label">Date:</label>
          <input
            type="date"
            className="modal-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Start Time */}
        <div className="input-row stacked">
          <label className="modal-label">Start Time:</label>
          <input
            type="time"
            className="modal-input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        {/* End Time */}
        <div className="input-row stacked">
          <label className="modal-label">End Time:</label>
          <input
            type="time"
            className="modal-input"
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

        {/* Buttons */}
        <div className="buttons">
          <button className="confirm" onClick={handleConfirm}>
            Confirm
          </button>
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
          {event.notificationEnabled && (
            <button 
              className="dismiss-notification" 
              onClick={handleDismissNotification}
              style={{
                backgroundColor: '#ff9800',
                color: 'white',
                marginLeft: '10px'
              }}
            >
              Dismiss Notification
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
