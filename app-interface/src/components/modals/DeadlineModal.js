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
    iconIndex: initialData?.iconIndex || 0,
    notificationEnabled: initialData?.notificationEnabled || false,
    notificationMinutesBefore: initialData?.notificationMinutesBefore || 30
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
      iconIndex: 0,
      notificationEnabled: false,
      notificationMinutesBefore: 30
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

      {/* Notification toggle */}
      <div className="input-row">
        <label className="modal-label">Reminder:</label>
        <div className="left-checkbox">
          <input
            type="checkbox"
            checked={formData.notificationEnabled}
            onChange={(e) =>
              setFormData({
                ...formData,
                notificationEnabled: e.target.checked,
              })
            }
          />
          <span style={{ marginLeft: "10px" }}>
              Enable Notification Reminder
            </span>
        </div>
      </div>

      {/* Notification time */}
      {formData.notificationEnabled && (
        <div className="input-row">
          <label className="modal-label">Notify Before:</label>
          <select
            className="modal-input"
            value={formData.notificationMinutesBefore}
            onChange={(e) =>
              setFormData({
                ...formData,
                notificationMinutesBefore: parseInt(e.target.value),
              })
            }
          >
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
          </select>
        </div>
      )}
    </ModalContainer>
  );
}

export default DeadlineModal;
