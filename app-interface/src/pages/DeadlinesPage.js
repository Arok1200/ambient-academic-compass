import React, { useState } from 'react';
import axios from 'axios';
import { useData } from '../context/DataContext';
import { API_BASE_URL } from '../services/api';
import { WIDGET_COLOR_DETAILS } from '../constants/colors';
import AddButton from '../components/AddButton';
import DeadlineItem from '../components/DeadlineItem';
import { DeadlineModal } from '../components/modals';
import './DeadlinesPage.css';

import assignmentIcon from '../assets/icons/assignment.svg';
import quizIcon from '../assets/icons/quiz.svg';
import studyingIcon from '../assets/icons/studying.svg';
import cleanIcon from '../assets/icons/clean.svg';
import groupDiscussionIcon from '../assets/icons/group-discussion.svg';

const ICON_MAP = [assignmentIcon, quizIcon, studyingIcon, cleanIcon, groupDiscussionIcon];

function DeadlinesPage() {
  const { deadlines, loading, loadData, hiddenWidgets, setHiddenWidgets } = useData();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const handleSubmitDeadline = async (formData) => {
    const dueAt = `${formData.dueDate}T${formData.dueTime}:00`;
    
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
    } catch (error) {
      console.error('Failed to add deadline:', error);
      alert('Failed to add deadline. Please check the date/time format and try again.');
    }
  };

  const handleToggleComplete = async (deadline) => {
    try {
      await axios.put(`${API_BASE_URL}/deadlines/${deadline.id}`, {
        ...deadline,
        completed: !deadline.completed
      });
      await loadData();
    } catch (error) {
      console.error('Failed to update deadline:', error);
    }
  };

  const handleMenuClick = async (deadline, action) => {
    if (action === 'reminder') {
      alert(`Set reminder for: ${deadline.title}`);
    } else if (action === 'edit') {
      console.log('Edit deadline:', deadline.title);
    } else if (action === 'delete') {
      if (window.confirm(`Delete "${deadline.title}"?`)) {
        try {
          await axios.delete(`${API_BASE_URL}/deadlines/${deadline.id}`);
          await loadData();
        } catch (error) {
          console.error('Failed to delete deadline:', error);
          alert('Failed to delete deadline');
        }
      }
    }
  };

  const handleToggleWidget = (deadline) => {
    setHiddenWidgets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deadline.id)) {
        newSet.delete(deadline.id);
      } else {
        newSet.add(deadline.id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
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

  const formatDateTime = (dateString) => {
    return `${formatDate(dateString)} - ${formatTime(dateString)}`;
  };

  const filteredDeadlines = deadlines.filter(d => 
    activeTab === 'active' ? !d.completed : d.completed
  );

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
              {filteredDeadlines.map((deadline) => {
                const colorDetail = WIDGET_COLOR_DETAILS[deadline.colorIndex || 0];
                const icon = ICON_MAP[deadline.iconIndex || 0];
                const isWidgetShown = !hiddenWidgets.has(deadline.id);
                
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
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <AddButton label="Add Deadline +" onClick={() => setShowModal(true)} />

      <DeadlineModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitDeadline}
      />
    </div>
  );
}

export default DeadlinesPage;
