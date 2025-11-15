import React, { useState } from 'react';
import ModalContainer from './ModalContainer';
import ColorSelector from '../ColorSelector';

function NoteModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    text: initialData?.text || '',
    colorIndex: initialData?.colorIndex || 0
  });

  const handleSubmit = () => {
    if (!formData.text) {
      alert('Please enter note text');
      return;
    }
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      text: '',
      colorIndex: 0
    });
    onClose();
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? "Edit Note" : "Add Note"}
      onConfirm={handleSubmit}
      onCancel={handleClose}
      confirmText={initialData ? "Save" : "Confirm"}
    >
      <div className="modal-row">
        <textarea
          className="modal-textarea"
          value={formData.text}
          onChange={(e) => setFormData({...formData, text: e.target.value})}
          placeholder="Enter your note..."
        />
      </div>

      <div className="modal-row">
        <label className="modal-label">Color</label>
        <ColorSelector
          selectedIndex={formData.colorIndex}
          onChange={(index) => setFormData({...formData, colorIndex: index})}
          useNoteColors={true}
        />
      </div>
    </ModalContainer>
  );
}

export default NoteModal;
