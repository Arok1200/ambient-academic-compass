import React, { useState } from 'react';
import ModalContainer from './ModalContainer';
import DatePicker from '../DatePicker';
import TimePicker from '../TimePicker';
import ColorSelector from '../ColorSelector';
import IconSelector from '../IconSelector';

function DeadlineModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    dueDate: initialData?.dueDate || '',
    dueTime: initialData?.dueTime || '',
    colorIndex: initialData?.colorIndex || 0,
    iconIndex: initialData?.iconIndex || 0
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.dueDate || !formData.dueTime) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      dueDate: '',
      dueTime: '',
      colorIndex: 0,
      iconIndex: 0
    });
    onClose();
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? "Edit Deadline" : "Add New Deadline"}
      onConfirm={handleSubmit}
      onCancel={handleClose}
      confirmText={initialData ? "Save" : "Confirm"}
    >
      <div className="input-row">
        <label className="modal-label">Title:</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Enter deadline title"
        />
      </div>

      <div className="input-row">
        <label className="modal-label">Date:</label>
        <DatePicker
          value={formData.dueDate}
          onChange={(date) => setFormData({...formData, dueDate: date})}
        />
      </div>

      <div className="input-row">
        <label className="modal-label">Time:</label>
        <TimePicker
          value={formData.dueTime}
          onChange={(time) => setFormData({...formData, dueTime: time})}
        />
      </div>

      <div className="input-row">
        <label className="modal-label">Color:</label>
        <ColorSelector
          selectedIndex={formData.colorIndex}
          onChange={(index) => setFormData({...formData, colorIndex: index})}
        />
      </div>

      <div className="input-row">
        <label className="modal-label">Icon:</label>
        <IconSelector
          selectedIndex={formData.iconIndex}
          onChange={(index) => setFormData({...formData, iconIndex: index})}
        />
      </div>
    </ModalContainer>
  );
}

export default DeadlineModal;
