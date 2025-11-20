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
  const { deadlines, setDeadlines, loadData, loading, visibleWidgets, setVisibleWidgets } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingDeadline, setDeletingDeadline] = useState(null);
  const [maxWidgetsModalOpen, setMaxWidgetsModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('active');

  const handleSubmitDeadline = async (formData) => {
    const dueAt = `${formData.dueDate}T${formData.dueTime}`;
    const deadlineData = {
      title: formData.title,
      description: '',
      dueAt,
      completed: false,
      pinned: false,
      iconIndex: formData.iconIndex,
      colorIndex: formData.colorIndex
    };

    try {
      await axios.post(`${API_BASE_URL}/deadlines`, deadlineData);
      await loadData();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add deadline:', error);
      alert('Failed to add deadline. Please check the date/time format and try again.');
    }
  };

  const handleEditDeadline = async (formData) => {
    if (!editingDeadline) return;

    const updatedDeadline = {
      ...editingDeadline,
      title: formData.title,
      dueAt: `${formData.dueDate}T${formData.dueTime}:00`,
      iconIndex: formData.iconIndex,
      colorIndex: formData.colorIndex
    };

    try {
      await axios.put(`${API_BASE_URL}/deadlines/${editingDeadline.id}`, updatedDeadline);
      setDeadlines(prev => prev.map(d => (d.id === editingDeadline.id ? updatedDeadline : d)));
      setEditModalOpen(false);
      setEditingDeadline(null);
    } catch (error) {
      console.error('Failed to edit deadline:', error);
      alert('Failed to update deadline');
    }
  };

  const handleDeleteDeadline = async () => {
    if (!deletingDeadline) return;
    try {
      await axios.delete(`${API_BASE_URL}/deadlines/${deletingDeadline.id}`);
      setDeadlines(prev => prev.filter(d => d.id !== deletingDeadline.id));
      setDeleteModalOpen(false);
      setDeletingDeadline(null);
    } catch (error) {
      console.error('Failed to delete deadline:', error);
      alert('Failed to delete deadline');
    }
  };

  const handleToggleComplete = async (deadline) => {
    try {
      const updated = { ...deadline, completed: !deadline.completed };
      await axios.put(`${API_BASE_URL}/deadlines/${deadline.id}`, updated);
      setDeadlines(prev => prev.map(d => d.id === deadline.id ? updated : d));
    } catch (error) {
      console.error('Failed to update deadline:', error);
    }
  };

  const handleMenuClick = (deadline, action) => {
    if (action === 'reminder') {
      const updatedDeadline = { ...deadline, pinned: !deadline.pinned };
      setDeadlines(prev => prev.map(d => d.id === deadline.id ? updatedDeadline : d));
      axios.put(`${API_BASE_URL}/deadlines/${deadline.id}`, updatedDeadline).catch(console.error);
    } else if (action === 'edit') {
      setEditingDeadline(deadline);
      setEditModalOpen(true);
    } else if (action === 'delete') {
      setDeletingDeadline(deadline);
      setDeleteModalOpen(true);
    }
  };

  const handleToggleWidget = (deadline) => {
    const isCurrentlyVisible = visibleWidgets.has(deadline.id);
    
    // If trying to show a widget but already have 5 active widgets
    if (!isCurrentlyVisible && visibleWidgets.size >= 5) {
      setMaxWidgetsModalOpen(true);
      return;
    }
    
    setVisibleWidgets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deadline.id)) newSet.delete(deadline.id);
      else newSet.add(deadline.id);
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  };
  const formatDateTime = (dateString) => `${formatDate(dateString)} - ${formatTime(dateString)}`;

  const filteredDeadlines = deadlines
    .filter(d => activeTab === 'active' ? !d.completed : d.completed)
    .sort((a, b) => {
      const dateA = new Date(a.dueAt);
      const dateB = new Date(b.dueAt);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="deadlines-page-container">
      <div className="deadlines-toggle-bar">
        <button className={`toggle-tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>Active</button>
        <button className={`toggle-tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>Completed</button>
      </div>

      <div className="deadlines-content">
        <div className="deadlines-list-bordered">
          {loading && <p className="deadlines-message">Loading deadlines...</p>}
          {!loading && filteredDeadlines.length === 0 && (
            <p className="deadlines-message">
              {activeTab === 'active'
                ? 'No active deadlines. Click "Add Deadline +" below to create one!'
                : 'No completed deadlines yet.'}
            </p>
          )}
          {!loading && filteredDeadlines.length > 0 && (
            <div className="deadlines-list-items">
              {filteredDeadlines.map(deadline => {
                const colorDetail = WIDGET_COLOR_DETAILS[deadline.colorIndex || 0];
                const icon = ICON_MAP[deadline.iconIndex || 0];
                const isOverdue = new Date(deadline.dueAt) <= new Date();
                const isWidgetShown = visibleWidgets.has(deadline.id);
                
                return (
                  <DeadlineItem
                    key={deadline.id}
                    icon={icon}
                    color={colorDetail}
                    date={formatDateTime(deadline.dueAt)}
                    time=""
                    title={deadline.title}
                    isCompleted={deadline.completed}
                    onComplete={() => handleToggleComplete(deadline)}
                    onMenuClick={(action) => handleMenuClick(deadline, action)}
                    showWidget={isWidgetShown}
                    onWidgetToggle={() => handleToggleWidget(deadline)}
                    isReminderOn={deadline.pinned}
                    isOverdue={isOverdue}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddButton label="Add Deadline +" onClick={() => setShowAddModal(true)} />

      {}
      <DeadlineModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitDeadline}
      />

      <EditDeadlineModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingDeadline(null); }}
        onSubmit={handleEditDeadline}
        initialData={editingDeadline}
      />

      <DeleteDeadlineModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingDeadline(null); }}
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
