import React from "react";
import "./SyncModal.css"; // your CSS file

export default function HelpModal({ isOpen, onClose }) {
      
    if (!isOpen) return null;


  const handleOverlayClick = (e) => {
    if (e.target.className === 'sync-modal-overlay') {
      onClose();
    }
  };
  return (
    <div className="sync-modal-overlay" onClick={handleOverlayClick}>
      <div className="sync-modal-content">

        <h2 className="sync-modal-title">Welcome to the Ambient Academic Compass!</h2>

        <p className="sync-modal-subtitle">
          <strong>Ambient Academic Compass</strong> is a productivity dashboard designed for students.
          It helps you track:
          <br /><br />
          • Class deadlines and assignments<br />
          • Daily events and schedule<br />
          • Desktop widgets for reminders<br />
          • A visual timeline progress bar<br />
          • Notes and quick references<br />
          <br />
          Use the <strong>left tabs</strong> to navigate between Events, Deadlines, and Notes.
          Use the <strong>right panel</strong> to customize widgets or view your desktop display.
        </p>

        <div className="sync-modal-buttons">
          <button className="sync-modal-btn sync-modal-close" onClick={onClose}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
