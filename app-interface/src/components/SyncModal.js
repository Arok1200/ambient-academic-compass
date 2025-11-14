import React, { useState } from 'react';
import './SyncModal.css';

function SyncModal({ isOpen, onClose, onConfirm }) {
  const [selectedSource, setSelectedSource] = useState('google');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedSource);
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'sync-modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="sync-modal-overlay" onClick={handleOverlayClick}>
      <div className="sync-modal-content">
        <h2 className="sync-modal-title">Sync from external source</h2>
        <p className="sync-modal-subtitle">
          Please select the source to sync from. You may be prompted to login if you are not already
        </p>

        <div className="sync-modal-options">
          <label className="sync-modal-option">
            <input
              type="radio"
              name="syncSource"
              value="google"
              checked={selectedSource === 'google'}
              onChange={(e) => setSelectedSource(e.target.value)}
            />
            <span>Google Calendar</span>
          </label>

          <label className="sync-modal-option">
            <input
              type="radio"
              name="syncSource"
              value="notion"
              checked={selectedSource === 'notion'}
              onChange={(e) => setSelectedSource(e.target.value)}
            />
            <span>Notion</span>
          </label>

          <label className="sync-modal-option">
            <input
              type="radio"
              name="syncSource"
              value="ios"
              checked={selectedSource === 'ios'}
              onChange={(e) => setSelectedSource(e.target.value)}
            />
            <span>iOS Calendar</span>
          </label>
        </div>

        <div className="sync-modal-buttons">
          <button className="sync-modal-btn sync-modal-confirm" onClick={handleConfirm}>
            Confirm
          </button>
          <button className="sync-modal-btn sync-modal-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default SyncModal;
