import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiddenWidgets, setHiddenWidgets] = useState(new Set());

  // Load hiddenWidgets from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('hiddenWidgets')) || [];
    setHiddenWidgets(new Set(saved));
  }, []);

  // Persist hiddenWidgets to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('hiddenWidgets', JSON.stringify([...hiddenWidgets]));
  }, [hiddenWidgets]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/deadlines`);
      setDeadlines(response.data);

      // Optional: initialize hiddenWidgets for new deadlines
      setHiddenWidgets(prev => {
        const updatedSet = new Set(prev);
        response.data.forEach(d => {
          if (!updatedSet.has(d.id)) updatedSet.add(d.id); // hidden by default
        });
        return updatedSet;
      });

    } catch (error) {
      console.error('Backend not available, using empty data:', error);
      setDeadlines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        deadlines,
        setDeadlines,
        loading,
        loadData,
        hiddenWidgets,
        setHiddenWidgets
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
