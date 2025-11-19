import React from 'react';
import './InputComponents.css';

function DatePicker({ value, onChange }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default DatePicker;
