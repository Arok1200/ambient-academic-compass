import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export { API_BASE_URL };

export const eventsAPI = {
  getAll: () => axios.get(`${API_BASE_URL}/events`),
  create: (event) => axios.post(`${API_BASE_URL}/events`, event),
  update: (id, event) => axios.put(`${API_BASE_URL}/events/${id}`, event),
  delete: (id) => axios.delete(`${API_BASE_URL}/api/events/${id}`),
};

export const deadlinesAPI = {
  getAll: () => axios.get(`${API_BASE_URL}/deadlines`),
  create: (deadline) => axios.post(`${API_BASE_URL}/deadlines`, deadline),
  update: (id, deadline) => axios.put(`${API_BASE_URL}/deadlines/${id}`, deadline),
  delete: (id) => axios.delete(`${API_BASE_URL}/deadlines/${id}`)
};
