import React, { useState } from 'react';
import './DateNavigation.css';

function DateNavigation() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Day');

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
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
        
        <div className="current-date">
          {formatDate(currentDate)}
        </div>
        
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
