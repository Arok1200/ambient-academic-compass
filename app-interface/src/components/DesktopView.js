import React, { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import './DesktopView.css';

import calendarIcon from '../assets/icons/calender.svg';
import assignmentIcon from '../assets/icons/assignment.svg';
import quizIcon from '../assets/icons/quiz.svg';
import groupIcon from '../assets/icons/group-discussion.svg';
import studyingIcon from '../assets/icons/studying.svg';
import cleanIcon from '../assets/icons/clean.svg';

const DesktopView = () => {
  const { deadlines, events } = useData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const activeWidgets = deadlines.filter(d => !d.checked && !d.widgetHidden).slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const parseTimeLabel = (label) => {
    const [time, ampm] = label.trim().split(' ');
    const [hStr, mStr] = time.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return h * 3600 + m * 60;
  };

  const nowSeconds = () => {
    const h = currentTime.getHours();
    const m = currentTime.getMinutes();
    const s = currentTime.getSeconds();
    return h * 3600 + m * 60 + s;
  };

  const pctOfDay = (seconds) => (seconds / 86400) * 100;

  const handleWidgetClick = (widget) => {
    setSelectedWidget(widget);
    setShowConfirm(false);
  };

  const handleCheckboxChange = () => {
    setShowConfirm(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setTimeout(() => setSelectedEvent(null), 3000);
  };

  const getWidgetIcon = (iconType) => {
    const iconMap = {
      'assignment': assignmentIcon,
      'quiz': quizIcon,
      'group': groupIcon,
      'studying': studyingIcon,
      'clean': cleanIcon,
      'email': assignmentIcon
    };
    return iconMap[iconType] || assignmentIcon;
  };

  return (
    <div className="desktop-view">
      <div className="widget-dock">
        <div className="calendar-widget">
          <img src={calendarIcon} alt="Calendar" className="calendar-icon" />
        </div>
        {activeWidgets.map((widget, index) => (
          <div
            key={widget.id}
            className={`widget ${widget.icon} ${index === 0 ? 'upcoming' : ''}`}
            style={{
              backgroundColor: widget.color,
              border: `4px solid ${widget.border}`,
              transform: `translateY(${index * 4}px) scale(${1.3 - index * 0.15})`,
              zIndex: 5 - index
            }}
            onClick={() => handleWidgetClick(widget)}
            data-color={widget.color}
            data-border={widget.border}
            data-title={`${widget.title} - due ${widget.dueDate}`}
          >
            <img src={getWidgetIcon(widget.icon)} alt={widget.icon} />
          </div>
        ))}
      </div>

      {selectedWidget && !showConfirm && (
        <div className="widget-popup show" style={{ borderColor: selectedWidget.border }}>
          <div className="popup-left">
            <div className="check-box" onClick={handleCheckboxChange}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <polyline points="3,9 7,13 15,5" fill="none" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
            <span>{selectedWidget.title}</span>
          </div>
          <span className="edit-icon">✏️</span>
        </div>
      )}

      {showConfirm && (
        <div className="confirm-popup show">
          <div>Mark as done?</div>
          <div className="confirm-buttons">
            <button className="confirm-btn yes-btn" onClick={() => {
              setShowConfirm(false);
              setSelectedWidget(null);
            }}>YES</button>
            <button className="confirm-btn no-btn" onClick={() => {
              setShowConfirm(false);
            }}>NO</button>
          </div>
        </div>
      )}

      <div className="timeline-container" id="timeline">
        {events.map((event, idx) => {
          const start = parseTimeLabel(event.startTime);
          const end = parseTimeLabel(event.endTime);
          const leftPct = pctOfDay(start);
          const widthPct = pctOfDay(end - start);
          
          return (
            <div
              key={event.id}
              className="event"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`
              }}
              onClick={() => handleEventClick(event)}
            />
          );
        })}

        <div className="past-fill" style={{ width: `${pctOfDay(nowSeconds())}%` }} />
        <div className="current-time" style={{ left: `${pctOfDay(nowSeconds())}%` }} />
      </div>

      <div className="time-labels">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>12 AM</span>
      </div>

      {selectedEvent && (
        <div className="event-popup show">
          <table>
            <tbody>
              <tr>
                <td><strong>{selectedEvent.name}</strong></td>
              </tr>
              <tr>
                <td>{selectedEvent.startTime} – {selectedEvent.endTime}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DesktopView;
