import React, { createContext, useState, useContext, useCallback } from 'react';
import { eventsAPI, deadlinesAPI } from '../services/api';

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
  const [notes, setNotes] = useState([
    { id: 1, content: 'Sample note 1' },
    { id: 2, content: 'Sample note 2' }
  ]);

  const loadData = useCallback(async () => {
    try {
      const [eventsRes, deadlinesRes] = await Promise.all([
        eventsAPI.getAll(),
        deadlinesAPI.getAll()
      ]);
      setEvents(eventsRes.data);
      setDeadlines(deadlinesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  const addEvent = async (event) => {
    try {
      const response = await eventsAPI.create(event);
      setEvents([...events, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  const updateEvent = async (id, updatedEvent) => {
    try {
      const response = await eventsAPI.update(id, updatedEvent);
      setEvents(events.map(e => e.id === id ? response.data : e));
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const deleteEvent = async (id) => {
    try {
      await eventsAPI.delete(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  const toggleEventComplete = async (id) => {
    const event = events.find(e => e.id === id);
    if (event) {
      await updateEvent(id, { ...event, completed: !event.completed });
    }
  };

  const addDeadline = async (deadline) => {
    try {
      const response = await deadlinesAPI.create(deadline);
      setDeadlines([...deadlines, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding deadline:', error);
      throw error;
    }
  };

  const updateDeadline = async (id, updatedDeadline) => {
    try {
      const response = await deadlinesAPI.update(id, updatedDeadline);
      setDeadlines(deadlines.map(d => d.id === id ? response.data : d));
      return response.data;
    } catch (error) {
      console.error('Error updating deadline:', error);
      throw error;
    }
  };

  const deleteDeadline = async (id) => {
    try {
      await deadlinesAPI.delete(id);
      setDeadlines(deadlines.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting deadline:', error);
      throw error;
    }
  };

  const toggleDeadlineComplete = async (id) => {
    const deadline = deadlines.find(d => d.id === id);
    if (deadline) {
      await updateDeadline(id, { ...deadline, completed: !deadline.completed });
    }
  };

  const toggleDeadlinePinned = async (id) => {
    const deadline = deadlines.find(d => d.id === id);
    if (deadline) {
      await updateDeadline(id, { ...deadline, pinned: !deadline.pinned });
    }
  };

  const addNote = (note) => {
    const newNote = { id: Date.now(), content: note };
    setNotes([...notes, newNote]);
  };

  const updateNote = (id, content) => {
    setNotes(notes.map(n => n.id === id ? { ...n, content } : n));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const value = {
    events,
    deadlines,
    notes,
    loadData,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventComplete,
    addDeadline,
    updateDeadline,
    deleteDeadline,
    toggleDeadlineComplete,
    toggleDeadlinePinned,
    addNote,
    updateNote,
    deleteNote,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export { DataContext };
