import React from 'react';
import './InputComponents.css';

function TimePicker({ value, onChange }) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default TimePicker;
