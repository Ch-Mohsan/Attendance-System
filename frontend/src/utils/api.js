import axios from 'axios';
import {
  decrementPendingRequests,
  incrementPendingRequests,
} from './loadingStore';

const baseURL = import.meta.env.VITE_BASE_URL || '/api';

// Create an axios instance with base URL
const api = axios.create({
  baseURL,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    incrementPendingRequests();
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    decrementPendingRequests();
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    decrementPendingRequests();
    return response;
  },
  (error) => {
    decrementPendingRequests();
    if (error.response?.status === 401) {
      // Clear token and redirect to login if token is invalid/expired
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 