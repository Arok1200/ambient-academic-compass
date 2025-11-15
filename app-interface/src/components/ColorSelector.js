import React from 'react';
import { WIDGET_COLOR_DETAILS, NOTE_COLORS } from '../constants/colors';
import './InputComponents.css';

function ColorSelector({ selectedIndex, onChange, useNoteColors = false }) {
  if (useNoteColors) {
    return (
      <div className="color-selector">
        {NOTE_COLORS.map((color, index) => (
          <div
            key={index}
            className={`color-swatch ${selectedIndex === index ? 'selected' : ''}`}
            style={{
              backgroundColor: color,
              border: `3px solid ${selectedIndex === index ? '#333' : 'transparent'}`
            }}
            onClick={() => onChange(index)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="color-selector">
      {WIDGET_COLOR_DETAILS.map((color, index) => (
        <div
          key={index}
          className={`color-swatch ${selectedIndex === index ? 'selected' : ''}`}
          style={{
            backgroundColor: color.bg,
            border: `3px solid ${selectedIndex === index ? color.border : 'transparent'}`
          }}
          onClick={() => onChange(index)}
        />
      ))}
    </div>
  );
}

export default ColorSelector;
