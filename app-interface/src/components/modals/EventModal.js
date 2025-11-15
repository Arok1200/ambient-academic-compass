import React, { useState } from 'react';
import ModalContainer from './ModalContainer';
import DatePicker from '../DatePicker';
import TimePicker from '../TimePicker';

function EventModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    eventDate: initialData?.eventDate || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || ''
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.eventDate || !formData.startTime || !formData.endTime) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      eventDate: '',
      startTime: '',
      endTime: ''
    });
    onClose();
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? "Edit Event" : "Add New Event"}
      onConfirm={handleSubmit}
      onCancel={handleClose}
      confirmText={initialData ? "Save" : "Confirm"}
    >
      <div className="modal-row">
        <label className="modal-label">Title</label>
        <input
          type="text"
          className="modal-input"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Enter event title"
        />
      </div>

      <div className="modal-row">
        <label className="modal-label">Date</label>
        <DatePicker
          value={formData.eventDate}
          onChange={(date) => setFormData({...formData, eventDate: date})}
        />
      </div>

      <div className="modal-row">
        <label className="modal-label">Start Time</label>
        <TimePicker
          value={formData.startTime}
          onChange={(time) => setFormData({...formData, startTime: time})}
        />
      </div>

      <div className="modal-row">
        <label className="modal-label">End Time</label>
        <TimePicker
          value={formData.endTime}
          onChange={(time) => setFormData({...formData, endTime: time})}
        />
      </div>
    </ModalContainer>
  );
}

export default EventModal;
