import React from 'react';
import './DesktopDisplayPage.css';

function DesktopDisplayPage() {
  const handleViewDesktop = () => {
    window.open('/desktop/desktop.html', '_blank');
  };

  return (
    <div className="desktop-view-container">
      <div className="desktop-panel">
        <h2 className="panel-title">Desktop Display</h2>

        <div className="section">
          <h3 className="section-title">Widgets</h3>
          <div className="section-divider"></div>
          
          <div className="widgets-display">
            <div className="widget-circle pink small"></div>
            <div className="widget-circle gray medium"></div>
            <div className="widget-circle green large"></div>
            <div className="widget-circle purple medium"></div>
            <div className="widget-circle blue small"></div>
          </div>

          <button className="disable-btn">Disable</button>
        </div>

        <div className="section">
          <h3 className="section-title">Progress Bar</h3>
          <div className="section-divider"></div>

          <div className="progress-display">
            <div className="progress-labels-top">
              <span>Badminton Match</span>
              <span>Gym</span>
            </div>

            <div className="progress-bar-segments">
              <div className="segment dark"></div>
              <div className="segment medium"></div>
              <div className="segment light"></div>
              <div className="segment medium"></div>
              <div className="segment dark"></div>
            </div>

            <div className="progress-labels-bottom">
              <span>HCI Class</span>
              <span>Team Meeting</span>
            </div>
          </div>

          <button className="disable-btn">Disable</button>
        </div>

        <button className="view-desktop-btn" onClick={handleViewDesktop}>
          View Desktop
        </button>
      </div>
    </div>
  );
}

export default DesktopDisplayPage;
