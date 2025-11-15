import React from 'react';
import './ModalContainer.css';

function MaxWidgetsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-center-content">
          <h2 className="modal-center-title">You have reached the maximum number of widgets!</h2>
          <p className="modal-center-text">Hide an active widget and try again</p>
          
          <div className="modal-center-buttons">
            <button className="modal-btn modal-btn-confirm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaxWidgetsModal;
