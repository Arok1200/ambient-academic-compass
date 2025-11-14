import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DesktopPanel.css';

function DesktopPanel() {
  const navigate = useNavigate();

  const handleDisableWidgets = () => {
    if (window.confirm('Disable all widgets?')) {
      alert('Widgets disabled');
    }
  };

  const handleDisableProgressBar = () => {
    if (window.confirm('Disable progress bar?')) {
      alert('Progress bar disabled');
    }
  };

  const handleViewDesktop = () => {
    navigate('/desktop');
  };

  return (
    <div className="desktop-panel">
      <div className="desktop-panel-header">
        <h3>Desktop Display</h3>
      </div>

      <div className="desktop-section">
        <h4 className="section-title">Widgets</h4>
        <div className="section-divider"></div>
        <div className="widgets-container">
          <div className="widget-circle widget-green"></div>
          <div className="widget-circle widget-pink"></div>
          <div className="widget-circle widget-gray"></div>
          <div className="widget-circle widget-purple"></div>
          <div className="widget-circle widget-blue"></div>
        </div>
        <button className="gray-btn" onClick={handleDisableWidgets}>
          Disable
        </button>
      </div>

      <div className="desktop-section">
        <h4 className="section-title">Progress Bar</h4>
        <div className="section-divider"></div>
        
        <div className="progress-labels-top">
          <span>Badminton Match</span>
          <span>Gym</span>
        </div>

        <div className="progress-bar-container">
          <div className="progress-segment segment-1"></div>
          <div className="progress-segment segment-2"></div>
          <div className="progress-segment segment-3"></div>
          <div className="progress-segment segment-4"></div>
        </div>

        <div className="progress-labels-bottom">
          <span>HCI Class</span>
          <span>Team Meeting</span>
        </div>

        <button className="gray-btn" onClick={handleDisableProgressBar}>
          Disable
        </button>
      </div>

      <button className="purple-btn view-desktop-btn" onClick={handleViewDesktop}>
        View Desktop
      </button>
    </div>
  );
}

export default DesktopPanel;
