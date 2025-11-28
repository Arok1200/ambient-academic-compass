import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleWidgets, setVisibleWidgets] = useState(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsResponse, deadlinesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/events`),
        axios.get(`${API_BASE_URL}/deadlines`)
      ]);
      setEvents(eventsResponse.data);
      setDeadlines(deadlinesResponse.data);

      // Initialize visible widgets from backend `widget` flag (fallback to `notificationEnabled`)
      try {
        const initialWidgetIds = (deadlinesResponse.data || [])
          .filter(d => (typeof d.widget !== 'undefined' ? d.widget : d.notificationEnabled))
          .map(d => d.id);

        if (initialWidgetIds.length > 0) {
          setVisibleWidgets(new Set(initialWidgetIds));
        }
      } catch (e) {
        // Ignore initialization errors and keep default visibleWidgets
        console.warn('Failed to initialize visible widgets from backend', e);
      }
    } catch (err) {
      console.warn('Backend not available, using empty data:', err.message);
      setEvents([]);
      setDeadlines([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Remove widgets for overdue deadlines
  useEffect(() => {
    if (deadlines.length > 0) {
      const now = new Date();
      const overdueDeadlineIds = deadlines
        .filter(d => new Date(d.dueAt) <= now)
        .map(d => d.id);
      
      if (overdueDeadlineIds.length > 0) {
        setVisibleWidgets(prev => {
          const newSet = new Set(prev);
          overdueDeadlineIds.forEach(id => newSet.delete(id));
          return newSet;
        });
      }
    }
  }, [deadlines]);

  const value = {
    events,
    deadlines,
    loading,
    error,
    loadData,
    setEvents,
    setDeadlines,
    visibleWidgets,
    setVisibleWidgets
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
