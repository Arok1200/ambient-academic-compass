import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MainLayout.css';
import { useData } from '../context/DataContext';
import { API_BASE_URL } from '../services/api';
import SyncModal from './SyncModal';
import googleCalendarService from '../services/googleCalendarService';
import notionService from '../services/notionService';
import { GOOGLE_CONFIG, NOTION_CONFIG, IOS_CALENDAR_NOTE } from '../config/apiConfig';
import { WIDGET_COLOR_DETAILS } from '../constants/colors';
import axios from 'axios';

import applogo from '../assets/icons/applogo.svg';
import settings from '../assets/icons/settings.svg';
import syncFrame from '../assets/icons/sync-frame.svg';
import syncIcon from '../assets/icons/sync-icon.jpg';
import helpIcon from '../assets/icons/help.svg';
import assignmentIcon from '../assets/icons/assignment.svg';
import quizIcon from '../assets/icons/quiz.svg';
import studyingIcon from '../assets/icons/studying.svg';
import cleanIcon from '../assets/icons/clean.svg';
import groupDiscussionIcon from '../assets/icons/group-discussion.svg';

function MainLayout({ children }) {
  const [profilePic, setProfilePic] = useState(null);
  const [widgetsEnabled, setWidgetsEnabled] = useState(true);
  const [progressBarEnabled, setProgressBarEnabled] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const location = useLocation();
  const { events, deadlines, loadData, hiddenWidgets } = useData();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
    }
  };

  const handleSyncModalOpen = () => {
    setShowSyncModal(true);
  };

  const handleSyncConfirm = async (source) => {
    setSyncing(true);
    setShowSyncModal(false);
    
    try {
      if (source === 'google') {
        await syncFromGoogle();
      } else if (source === 'notion') {
        await syncFromNotion();
      } else if (source === 'ios') {
        alert(IOS_CALENDAR_NOTE);
        setSyncing(false);
        return;
      }
      
      alert(`Data synced successfully from ${source === 'google' ? 'Google Calendar' : source === 'notion' ? 'Notion' : 'iOS Calendar'}!`);
    } catch (error) {
      console.error('Sync error:', error);
      alert('Sync failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const syncFromGoogle = async () => {
    try {
      if (!GOOGLE_CONFIG.apiKey || GOOGLE_CONFIG.apiKey === 'your-google-api-key' ||
          !GOOGLE_CONFIG.clientId || GOOGLE_CONFIG.clientId === 'your-google-client-id.apps.googleusercontent.com') {
        throw new Error('Google Calendar API credentials not configured. Please add REACT_APP_GOOGLE_CLIENT_ID and REACT_APP_GOOGLE_API_KEY to your .env file. See API_SETUP_GUIDE.md for instructions.');
      }

      if (!googleCalendarService.isInitialized) {
        await googleCalendarService.initClient(
          GOOGLE_CONFIG.apiKey,
          GOOGLE_CONFIG.clientId
        );
      }

      if (!googleCalendarService.isSignedIn()) {
        await googleCalendarService.signIn();
      }

      const [calendarEvents, tasks] = await Promise.all([
        googleCalendarService.getCalendarEvents(),
        googleCalendarService.getAllTasks()
      ]);

      const transformedEvents = googleCalendarService.transformEventsToAppFormat(calendarEvents);
      const transformedDeadlines = googleCalendarService.transformTasksToAppFormat(tasks);

      await Promise.all([
        ...transformedEvents.map(event => 
          axios.post(`${API_BASE_URL}/events`, event)
        ),
        ...transformedDeadlines.map(deadline => 
          axios.post(`${API_BASE_URL}/deadlines`, deadline)
        )
      ]);

      await loadData();
    } catch (error) {
      console.error('Google sync error:', error);
      throw new Error('Failed to sync from Google Calendar: ' + error.message);
    }
  };

  const syncFromNotion = async () => {
    try {
      if (!NOTION_CONFIG.clientId || NOTION_CONFIG.clientId === 'your-notion-client-id' ||
          !NOTION_CONFIG.clientSecret || NOTION_CONFIG.clientSecret === 'your-notion-client-secret') {
        throw new Error('Notion API credentials not configured. Please add REACT_APP_NOTION_CLIENT_ID and REACT_APP_NOTION_CLIENT_SECRET to your .env file. See API_SETUP_GUIDE.md for instructions.');
      }

      const hasToken = notionService.loadStoredToken();

      if (!hasToken) {
        notionService.initiateOAuth(
          NOTION_CONFIG.clientId,
          NOTION_CONFIG.redirectUri
        );
        return;
      }

      const databases = await notionService.searchDatabases();
      
      if (databases.length === 0) {
        throw new Error('No databases found in your Notion workspace');
      }

      const pages = await notionService.queryDatabase(databases[0].id);
      
      const transformedItems = notionService.transformPagesToAppFormat(pages);

      await Promise.all(
        transformedItems.map(item => {
          const endpoint = item.type === 'event' ? 'events' : 'deadlines';
          return axios.post(`${API_BASE_URL}/${endpoint}`, item.data);
        })
      );

      await loadData();
    } catch (error) {
      console.error('Notion sync error:', error);
      throw new Error('Failed to sync from Notion: ' + error.message);
    }
  };

  const handleViewDesktop = () => {
    window.open('/desktop/desktop-sync.html', '_blank');
  };

  const handleToggleWidgets = () => {
    setWidgetsEnabled(!widgetsEnabled);
  };

  const handleToggleProgressBar = () => {
    setProgressBarEnabled(!progressBarEnabled);
  };

  const isActive = (path) => location.pathname === path;

  const getUpcomingDeadlines = () => {
    if (!deadlines || deadlines.length === 0) return [];
    
    const now = new Date();
    return deadlines
      .filter(d => !hiddenWidgets.has(d.id) && new Date(d.dueAt) > now && !d.completed)
      .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
      .slice(0, 5);
  };

  const getTodayEvents = () => {
    if (!events || events.length === 0) return [];
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    return events
      .filter(e => {
        const eventStart = new Date(e.startTime);
        return eventStart >= startOfDay && eventStart <= endOfDay;
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  };

  const calculateEventPosition = (eventTime) => {
    const eventDate = new Date(eventTime);
    const hours = eventDate.getHours();
    const minutes = eventDate.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes / 1440) * 100;
  };

  const calculateEventWidth = (startTime, endTime) => {
    const startPos = calculateEventPosition(startTime);
    const endPos = calculateEventPosition(endTime);
    return endPos - startPos;
  };

  const upcomingDeadlines = getUpcomingDeadlines();
  const todayEvents = getTodayEvents();

  return (
    <div className="app-container">
      <div className="main-border-wrapper">
        <header className="app-header">
          <div className="logo-title">
            <img src={applogo} alt="Logo" className="app-logo" />
            <h1>Ambient Academic Compass</h1>
          </div>

          <div className="header-buttons">
            <button 
              className="sync-btn-combined" 
              title="Sync" 
              onClick={handleSyncModalOpen}
              disabled={syncing}
            >
              <img src={syncFrame} alt="" className="sync-frame" />
              <img src={syncIcon} alt="Sync" className="sync-icon-img" />
            </button>

            <button className="plain-icon-btn" title="Settings">
              <img src={settings} alt="Settings" className="header-icon" />
            </button>

            <button className="plain-icon-btn" title="Help">
              <img src={helpIcon} alt="Help" className="header-icon" />
            </button>

            <label className="profile-upload" title="Upload Profile Picture">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <div className="profile-circle">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="profile-pic" />
                ) : (
                  <span className="profile-placeholder">+</span>
                )}
              </div>
            </label>
          </div>
        </header>

      <div className="page-with-desktop">
        <div className="left-section">
          <div className="tab-bar-container">
            <Link to="/events" className={`tab ${isActive('/events') || isActive('/') ? 'active' : ''}`}>Events</Link>
            <Link to="/deadlines" className={`tab ${isActive('/deadlines') ? 'active' : ''}`}>Deadlines</Link>
            <Link to="/notes" className={`tab ${isActive('/notes') ? 'active' : ''}`}>Notes</Link>
          </div>
          <main className="content-area">{children}</main>
        </div>

        {location.pathname !== '/desktop' && (
        <aside className="right-panel">
            <div className="desktop-display-header">
              <h3>Desktop Display</h3>
            </div>

            <section className="panel-section">
              <div className="panel-subheader">
                <h3>
                  Widgets
                  <span className="tooltip-container" tabIndex="0" aria-label="Widgets tooltip">
                    <svg className="tooltip-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                    <span className="tooltip-text">Shows upcoming deadlines as widgets on the desktop display.</span>
                  </span>
                </h3>
              </div>
              <div className="section-body">
                {widgetsEnabled && (
                  <div className="widgets-display">
                    {upcomingDeadlines.length > 0 ? (
                      upcomingDeadlines.map((deadline, index) => {
                        const colorDetail = WIDGET_COLOR_DETAILS[deadline.colorIndex || 0];
                        const icons = [assignmentIcon, quizIcon, studyingIcon, cleanIcon, groupDiscussionIcon];
                        const iconSrc = icons[deadline.iconIndex || 0];
                        const sizes = ['largest', 'large', 'medium', 'small', 'smallest'];
                        const size = sizes[Math.min(index, sizes.length - 1)];
                        
                        return (
                          <div 
                            key={deadline.id || index} 
                            className={`widget-box ${size}`}
                            style={{
                              backgroundColor: colorDetail.bg,
                              border: `3px solid ${colorDetail.border}`
                            }}
                            title={`${deadline.title} - Due: ${new Date(deadline.dueAt).toLocaleDateString()}`}
                          >
                            <img src={iconSrc} alt={deadline.title} />
                          </div>
                        );
                      })
                    ) : (
                      <div className="no-data-message">No upcoming deadlines</div>
                    )}
                  </div>
                )}
                <button className="sidebar-btn" onClick={handleToggleWidgets}>
                  {widgetsEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </section>

            <section className="panel-section">
              <div className="panel-subheader">
                <h3>
                  Progress Bar
                  <span className="tooltip-container" tabIndex="0" aria-label="Progress Bar tooltip">
                    <svg className="tooltip-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                    <span className="tooltip-text">Displays today's events along a 24-hour timeline on the desktop.</span>
                  </span>
                </h3>
              </div>
              <div className="section-body">
                {progressBarEnabled && (
                  <div className="progress-display">
                    {todayEvents.length > 0 ? (
                      <div className="timeline-container">
                        <div className="timeline-bar">
                          {todayEvents.map((event, index) => {
                            const position = calculateEventPosition(event.startTime);
                            const width = calculateEventWidth(event.startTime, event.endTime);
                            const eventStart = new Date(event.startTime);
                            const eventEnd = new Date(event.endTime);
                            const startStr = eventStart.toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            });
                            const endStr = eventEnd.toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            });
                            const isEven = index % 2 === 0;
                            
                            return (
                              <div 
                                key={event.id || index}
                                className={`timeline-event ${isEven ? 'label-above' : 'label-below'}`}
                                style={{ left: `${position}%`, width: `${width}%` }}
                                title={`${event.title}: ${startStr} - ${endStr}`}
                              >
                                <div className="timeline-marker"></div>
                                <div className="timeline-label">
                                  <div className="event-time">{startStr} - {endStr}</div>
                                  <div className="event-name">{event.title}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="timeline-hours">
                          <span>12 AM</span>
                          <span>6 AM</span>
                          <span>12 PM</span>
                          <span>6 PM</span>
                          <span>11 PM</span>
                        </div>
                      </div>
                    ) : (
                      <div className="no-data-message">No events today</div>
                    )}
                  </div>
                )}
                <button className="sidebar-btn" onClick={handleToggleProgressBar}>
                  {progressBarEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </section>

            <button className="view-desktop-btn" onClick={handleViewDesktop}>
              View Desktop
            </button>
          </aside>
        )}
      </div>
      </div>

      <SyncModal 
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onConfirm={handleSyncConfirm}
      />
    </div>
  );
}

export default MainLayout;
