import React, { useState, useRef } from 'react';
import OverflowMenu from './OverflowMenu';
import './DeadlineItem.css';

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
  selected = false
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
        <div className="menu-container">
          <button 
            ref={menuButtonRef}
            className="deadline-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Options"
          >
            ⋮
          </button>
          <OverflowMenu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            onReminderClick={() => onMenuClick?.('reminder')}
            onEditClick={() => onMenuClick?.('edit')}
            onDeleteClick={() => onMenuClick?.('delete')}
            anchorRef={menuButtonRef}
          />
        </div>
        <button 
          className={`deadline-widget-btn ${!showWidget ? 'show-widget' : ''}`}
          onClick={onWidgetToggle}
        >
          {showWidget ? 'Hide Widget' : 'Show Widget'}
        </button>
      </div>
    </div>
  );
}

export default DeadlineItem;
