import React from 'react';
import axios from 'axios';
import { useData } from '../context/DataContext';
import { API_BASE_URL } from '../services/api';
import { WIDGET_COLORS } from '../constants/colors';
import AddButton from '../components/AddButton';

function DeadlinesPage() {
  const { deadlines, loading, loadData } = useData();

  const handleAddDeadline = async () => {
    const title = prompt('Enter deadline title:');
    if (!title) return;
    
    const description = prompt('Enter deadline description (optional):');
    const dueAt = prompt('Enter due date (YYYY-MM-DDTHH:MM:SS):');
    const pinnedResponse = prompt('Pin this deadline? (yes/no):', 'no');
    const pinned = pinnedResponse?.toLowerCase() === 'yes';
    
    const newDeadline = {
      title,
      description: description || '',
      dueAt,
      completed: false,
      pinned
    };
    
    try {
      await axios.post(`${API_BASE_URL}/deadlines`, newDeadline);
      await loadData();
      alert('Deadline added successfully!');
    } catch (error) {
      console.error('Failed to add deadline:', error);
      alert('Failed to add deadline. Please try again.');
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

  const getIconColor = (index) => {
    return WIDGET_COLORS[index % WIDGET_COLORS.length];
  };

  return (
    <div className="deadlines-page-container">
      <div className="deadlines-content">
        <div className="deadlines-list-container">
          {loading && <p className="deadlines-message">Loading deadlines...</p>}
          
          {!loading && deadlines.length === 0 && (
            <p className="deadlines-message">No deadlines yet. Click "Add Deadline +" below to create your first deadline!</p>
          )}
          
          {!loading && deadlines.length > 0 && (
            <div className="deadlines-list">
              {deadlines.map((deadline, index) => (
                <div key={deadline.id} className="deadline-item">
                  <div className="deadline-left">
                    <input 
                      type="checkbox" 
                      className="deadline-checkbox"
                      checked={deadline.completed}
                      onChange={() => handleToggleComplete(deadline)}
                    />
                    <div 
                      className="deadline-icon" 
                      style={{ backgroundColor: getIconColor(index) }}
                    />
                  </div>
                  
                  <div className="deadline-middle">
                    <div className="deadline-title">{deadline.title}</div>
                    <div className="deadline-date">
                      {new Date(deadline.dueAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  <button className="deadline-hide-btn">Hide Widget</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <AddButton label="Add Deadline +" onClick={handleAddDeadline} />
    </div>
  );
}

export default DeadlinesPage;
