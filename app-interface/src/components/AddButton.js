import React from 'react';
import './AddButton.css';

function AddButton({ label, onClick }) {
  return (
    <div className="add-button-container">
      <button className="add-button" onClick={onClick}>
        {label}
      </button>
    </div>
  );
}

export default AddButton;
