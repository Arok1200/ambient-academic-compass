import React, { createContext, useContext, useState, useCallback } from 'react';
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
  const [hiddenWidgets, setHiddenWidgets] = useState(new Set());

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
    } catch (err) {
      console.warn('Backend not available, using empty data:', err.message);
      setEvents([]);
      setDeadlines([]);
      setError(null); // Don't show error to user
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    events,
    deadlines,
    loading,
    error,
    loadData,
    setEvents,
    setDeadlines,
    hiddenWidgets,
    setHiddenWidgets
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
