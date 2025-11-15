import React from 'react';
import './InputComponents.css';

function DatePicker({ value, onChange }) {
  return (
    <input
      type="date"
      className="figma-input date-picker"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default DatePicker;
