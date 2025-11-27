import React, { useState } from 'react';
import axios from 'axios';
import { useData } from '../context/DataContext';
import { API_BASE_URL } from '../services/api';
import { WIDGET_COLOR_DETAILS } from '../constants/colors';
import AddButton from '../components/AddButton';
import DeadlineItem from '../components/DeadlineItem';
import { DeadlineModal, EditDeadlineModal, DeleteDeadlineModal, MaxWidgetsModal } from '../components/modals';
import './DeadlinesPage.css';

import assignmentIcon from '../assets/icons/assignment.svg';
import quizIcon from '../assets/icons/quiz.svg';
import studyingIcon from '../assets/icons/studying.svg';
import cleanIcon from '../assets/icons/clean.svg';
import groupDiscussionIcon from '../assets/icons/group-discussion.svg';

const ICON_MAP = [assignmentIcon, quizIcon, studyingIcon, cleanIcon, groupDiscussionIcon];

function DeadlinesPage() {
  const { deadlines, setDeadlines, loadData, loading } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingDeadline, setDeletingDeadline] = useState(null);

  const [maxWidgetsModalOpen, setMaxWidgetsModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('active');

  // ------------------------- CREATE DEADLINE -------------------------
  const handleSubmitDeadline = async (formData) => {
    const dueAt = `${formData.dueDate}T${formData.dueTime}`;

    const deadlineData = {
      title: formData.title,
      description: '',
      dueAt,
      completed: false,
      iconIndex: formData.iconIndex,
      colorIndex: formData.colorIndex,

      // Notifications
      notificationEnabled: formData.notificationEnabled || false,
      notificationMinutesBefore:
        formData.notificationEnabled ? formData.notificationMinutesBefore : null,

      // Widget (always false when creating)
      widget: false
    };

    try {
      await axios.post(`${API_BASE_URL}/deadlines`, deadlineData);
      await loadData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add deadline:', error);
      alert('Failed to add deadline.');
    }
  };

  // ------------------------- EDIT DEADLINE -------------------------
  const handleEditDeadline = async (formData) => {
    if (!editingDeadline) return;

    const updatedDeadline = {
      ...editingDeadline,
      title: formData.title,
      dueAt: `${formData.dueDate}T${formData.dueTime}:00`,
      iconIndex: formData.iconIndex,
      colorIndex: formData.colorIndex,

      notificationEnabled: formData.notificationEnabled || false,
      notificationMinutesBefore:
        formData.notificationEnabled ? formData.notificationMinutesBefore : null
    };

    try {
      await axios.put(`${API_BASE_URL}/deadlines/${editingDeadline.id}`, updatedDeadline);
      setDeadlines((prev) =>
        prev.map((d) => (d.id === editingDeadline.id ? updatedDeadline : d))
      );
      setEditModalOpen(false);
      setEditingDeadline(null);
    } catch {
      alert('Failed to update deadline');
    }
  };

  // ------------------------- DELETE DEADLINE -------------------------
  const handleDeleteDeadline = async () => {
    if (!deletingDeadline) return;

    try {
      await axios.delete(`${API_BASE_URL}/deadlines/${deletingDeadline.id}`);
      setDeadlines((prev) => prev.filter((d) => d.id !== deletingDeadline.id));
      setDeleteModalOpen(false);
      setDeletingDeadline(null);
    } catch {
      alert('Failed to delete deadline');
    }
  };

  // ------------------------- COMPLETE/INCOMPLETE -------------------------
  const handleToggleComplete = async (deadline) => {
    try {
      const updated = { ...deadline, completed: !deadline.completed };
      await axios.put(`${API_BASE_URL}/deadlines/${deadline.id}`, updated);

      setDeadlines((prev) =>
        prev.map((d) => (d.id === deadline.id ? updated : d))
      );
    } catch {
      console.error('Failed to toggle complete');
    }
  };

  // ------------------------- REMINDER / EDIT / DELETE -------------------------
  const handleMenuClick = (deadline, action) => {
    if (action === 'reminder') {
      const updated = {
        ...deadline,
        notificationEnabled: !deadline.notificationEnabled
      };

      setDeadlines((prev) =>
        prev.map((d) => (d.id === deadline.id ? updated : d))
      );

      axios.put(`${API_BASE_URL}/deadlines/${deadline.id}`, updated);
    }

    if (action === 'edit') {
      setEditingDeadline(deadline);
      setEditModalOpen(true);
    }

    if (action === 'delete') {
      setDeletingDeadline(deadline);
      setDeleteModalOpen(true);
    }

    if (action === 'widget') {
      // If trying to toggle from false → true, enforce rules
      const isCurrentlyVisible = deadline.widget;
      const now = new Date();

      if (!isCurrentlyVisible) {
        // Count how many deadlines already have widget = true AND are not overdue
        const activeWidgetsCount = deadlines.filter(
          (d) => d.widget && new Date(d.dueAt) > now
        ).length;

        if (activeWidgetsCount >= 5) {
          // Show max widgets modal
          setMaxWidgetsModalOpen(true);
          return;
        }

        if (new Date(deadline.dueAt) <= now) {
          // Cannot show overdue deadlines
          alert("Cannot show widget for overdue deadlines.");
          return;
        }
      }

      // Toggle widget locally
      const updated = {
        ...deadline,
        widget: !deadline.widget
      };

      setDeadlines((prev) =>
        prev.map((d) => (d.id === deadline.id ? updated : d))
      );

      // Persist to backend
      axios.put(`${API_BASE_URL}/deadlines/${deadline.id}`, updated)
        .then(() => console.log('Toggled widget for deadline:', deadline.id))
        .catch(console.error);
    }

  };

  // ------------------------- WIDGET TOGGLE (DB ONLY) -------------------------
  const handleToggleWidget = (deadline) => {
    const totalWidgets = deadlines.filter((d) => d.widget).length;
    const turningOn = !deadline.widget;

    // Enforce max 5
    if (turningOn && totalWidgets >= 5) {
      setMaxWidgetsModalOpen(true);
      return;
    }

    const updated = { ...deadline, widget: turningOn };

    // Update UI immediately
    setDeadlines((prev) =>
      prev.map((d) => (d.id === deadline.id ? updated : d))
    );

    // Persist to backend
    axios.put(`${API_BASE_URL}/deadlines/${deadline.id}`, updated);
  };

  // ------------------------- FORMATTERS -------------------------
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  const formatDateTime = (dateString) =>
    `${formatDate(dateString)} - ${formatTime(dateString)}`;

  // ------------------------- FILTER DEADLINES -------------------------
  const filteredDeadlines = deadlines
    .filter((d) => (activeTab === 'active' ? !d.completed : d.completed))
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

  // ------------------------- RENDER -------------------------
  return (
    <div className="deadlines-page-container">
      <div className="deadlines-toggle-bar">
        <button
          className={`toggle-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>

        <button
          className={`toggle-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      <div className="deadlines-content">
        <div className="deadlines-list-bordered">
          {loading && <p>Loading deadlines...</p>}

          {!loading && filteredDeadlines.length === 0 && (
            <p className="deadlines-message">
              {activeTab === 'active'
                ? 'No active deadlines.'
                : 'No completed deadlines.'}
            </p>
          )}

          {!loading && filteredDeadlines.length > 0 && (
            <div className="deadlines-list-items">
              {filteredDeadlines.map((deadline) => {
                const colorDetail = WIDGET_COLOR_DETAILS[deadline.colorIndex || 0];
                const icon = ICON_MAP[deadline.iconIndex || 0];
                const isOverdue = new Date(deadline.dueAt) <= new Date();

                return (
                  <DeadlineItem
                    key={deadline.id}
                    icon={icon}
                    color={colorDetail}
                    date={formatDateTime(deadline.dueAt)}
                    title={deadline.title}
                    isCompleted={deadline.completed}
                    onComplete={() => handleToggleComplete(deadline)}
                    onMenuClick={(action) => handleMenuClick(deadline, action)}
                    showWidget={deadline.widget}
                    onWidgetToggle={() => handleToggleWidget(deadline)}
                    isReminderOn={!!deadline.notificationEnabled}
                    isOverdue={isOverdue}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddButton label="Add Deadline +" onClick={() => setShowAddModal(true)} />

      {/* Modals */}
      <DeadlineModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitDeadline}
      />

      <EditDeadlineModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingDeadline(null);
        }}
        onSubmit={handleEditDeadline}
        initialData={editingDeadline}
      />

      <DeleteDeadlineModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingDeadline(null);
        }}
        onConfirm={handleDeleteDeadline}
        deadline={deletingDeadline}
      />

      <MaxWidgetsModal
        isOpen={maxWidgetsModalOpen}
        onClose={() => setMaxWidgetsModalOpen(false)}
      />
    </div>
  );
}

export default DeadlinesPage;
