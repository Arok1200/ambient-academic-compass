import React, { useState, useRef } from 'react';
import OverflowMenu from './OverflowMenu';
import './DeadlineItem.css';

// Bell outline
const OutlineBellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// Bell filled
const FilledBellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

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

function DeadlineItem({ 
  icon,
  color,
  date,
  time,
  title,
  isCompleted,
  onComplete,
  onMenuClick,
  showWidget,
  onWidgetToggle,
  selected = false,
  isReminderOn
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);

  return (
    <div className={`deadline-item-row ${selected ? 'selected' : ''}`}>
      <div className="deadline-checkbox-container">
        <input 
          type="checkbox" 
          className="deadline-checkbox-figma"
          checked={isCompleted}
          onChange={onComplete}
        />
      </div>

      <div 
        className="deadline-color-box"
        style={{
          backgroundColor: color.bg,
          border: `2.5px solid ${color.border}`
        }}
      >
        <img src={icon} alt={title} className="deadline-icon-img" />
      </div>

      <div className="deadline-text-section">
        <div className="deadline-title-text">{title}</div>
        <div className="deadline-datetime-text">
          {date}{time && ` • ${time}`}
        </div>
      </div>

      <div className="deadline-actions-section">
        <div className="deadline-actions-section">

          {/* Reminder toggle */}
          <button 
            type="button"
            className={`icon-btn deadline-icon-btn ${isReminderOn ? 'active' : ''}`}
            onClick={() => onMenuClick?.('reminder')}
            title="Reminder"
          >
            {isReminderOn ? (
              <FilledBellIcon />
            ) : (
              <OutlineBellIcon />
            )}
          </button>

          {/* Edit */}
          <button 
            className="icon-btn deadline-icon-btn"
            onClick={() => onMenuClick?.('edit')}
            title="Edit"
          >
            <EditIcon />
          </button>

          {/* Delete */}
          <button 
            className="icon-btn deadline-icon-btn"
            onClick={() => onMenuClick?.('delete')}
            title="Delete"
          >
            <DeleteIcon />
          </button>

          {/* Widget toggle */}
          <button 
            className={`deadline-widget-btn ${!showWidget ? 'show-widget' : ''}`}
            onClick={onWidgetToggle}
          >
            {showWidget ? 'Hide Widget' : 'Show Widget'}
          </button>

        </div>
      </div>
    </div>
  );
}

export default DeadlineItem;
