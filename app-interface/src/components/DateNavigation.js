import React, { useState } from 'react';
import './DateNavigation.css';

function DateNavigation({ selectedDate, setSelectedDate }) {
  const [viewMode, setViewMode] = useState("Day");

  const formatDate = (date) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleViewChange = (e) => {
    setViewMode(e.target.value);
  };

  return (
    <div className="date-navigation">
      <div className="date-with-arrows">
        <button className="nav-arrow" onClick={handlePreviousDay} title="Previous day">
          &lt;
        </button>
        <div className="current-date">{formatDate(selectedDate)}</div>
        <button className="nav-arrow" onClick={handleNextDay} title="Next day">
          &gt;
        </button>
      </div>

      <select className="view-dropdown" value={viewMode} onChange={handleViewChange}>
        <option value="Day">Day</option>
        <option value="Week">Week</option>
        <option value="Month">Month</option>
      </select>
    </div>
  );
}

export default DateNavigation;
