import React from 'react';
import './DeadlineItem.css';

const OutlineBellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const FilledBellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

function EventItem({
  title,
  datetime,
  onEdit,
  onDelete,
  isReminderOn,
  onToggleReminder
}) {
  return (
    <div className={`event-row`}> 
      <div className="event-info">
        <div className="event-title">{title}</div>
        <div className="event-datetime">{datetime}</div>
      </div>

      <div className="event-actions">
        <button
          type="button"
          className={`icon-btn deadline-icon-btn ${isReminderOn ? 'active' : ''}`}
          onClick={onToggleReminder}
          title="Reminder"
        >
          {isReminderOn ? <FilledBellIcon /> : <OutlineBellIcon />}
        </button>

        <button onClick={onEdit} className="deadline-icon-btn">
          <EditIcon />
        </button>

        <button onClick={onDelete} className="deadline-icon-btn">
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
}

export default EventItem;
