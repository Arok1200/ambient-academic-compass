import React, { useState, useEffect } from 'react';
import ModalContainer from './ModalContainer';
import DatePicker from '../DatePicker';
import TimePicker from '../TimePicker';
import ColorSelector from '../ColorSelector';
import IconSelector from '../IconSelector';

function EditDeadlineModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    dueDate: '',
    dueTime: '',
    colorIndex: 0,
    iconIndex: 0,
    notificationEnabled: false,
    notificationMinutesBefore: 30,
  });

  // Prefill inputs when editing
  useEffect(() => {
    if (initialData) {
      const due = new Date(initialData.dueAt);

      const year = due.getFullYear();
      const month = String(due.getMonth() + 1).padStart(2, '0');
      const day = String(due.getDate()).padStart(2, '0');
      const dueDate = `${year}-${month}-${day}`;

      const hours = String(due.getHours()).padStart(2, '0');
      const minutes = String(due.getMinutes()).padStart(2, '0');
      const dueTime = `${hours}:${minutes}`;

      setFormData({
        title: initialData.title || '',
        dueDate,
        dueTime,
        colorIndex: initialData.colorIndex || 0,
        iconIndex: initialData.iconIndex || 0,
        notificationEnabled: initialData.notificationEnabled || false,
        notificationMinutesBefore: initialData.notificationMinutesBefore || 30,
      });
    }
  }, [initialData]);

  const resetForm = () => {
    setFormData({
      title: '',
      dueDate: '',
      dueTime: '',
      colorIndex: 0,
      iconIndex: 0,
      notificationEnabled: false,
      notificationMinutesBefore: 30,
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.dueDate || !formData.dueTime) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? 'Edit Deadline' : 'Add New Deadline'}
      onConfirm={handleSubmit}
      onCancel={handleClose}
      confirmText={initialData ? 'Save' : 'Confirm'}
    >
      {/* Title */}
      <div className="input-row">
        <label className="modal-label">Title:</label>
        <input
          type="text"
          className="modal-input"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          placeholder="Enter deadline title"
        />
      </div>

      {/* Date */}
      <div className="input-row">
        <label className="modal-label">Date:</label>
        <DatePicker
          value={formData.dueDate}
          onChange={(date) => setFormData({ ...formData, dueDate: date })}
        />
      </div>

      {/* Time */}
      <div className="input-row">
        <label className="modal-label">Time:</label>
        <TimePicker
          value={formData.dueTime}
          onChange={(time) => setFormData({ ...formData, dueTime: time })}
        />
      </div>

      {/* Color */}
      <div className="input-row">
        <label className="modal-label">Color:</label>
        <ColorSelector
          selectedIndex={formData.colorIndex}
          onChange={(index) =>
            setFormData({ ...formData, colorIndex: index })
          }
        />
      </div>

      {/* Icon */}
      <div className="input-row">
        <label className="modal-label">Icon:</label>
        <IconSelector
          selectedIndex={formData.iconIndex}
          onChange={(index) =>
            setFormData({ ...formData, iconIndex: index })
          }
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

export default EditDeadlineModal;
