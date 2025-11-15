import React from 'react';
import './ModalContainer.css';

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-center-content">
          <h2 className="modal-center-title">Delete {itemName}?</h2>
          <p className="modal-center-text">This action cannot be undone.</p>
          
          <div className="modal-center-buttons">
            <button className="modal-btn modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
