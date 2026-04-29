import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';
import LoaderOverlay from '../components/LoaderOverlay.jsx';
import { subscribeToPendingRequests } from '../utils/loadingStore.js';

const UserContext = createContext();

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    // Check for token and validate it on mount
    const token = localStorage.getItem('token');
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return subscribeToPendingRequests(setPendingRequests);
  }, []);

  const validateToken = async () => {
    try {
      const response = await api.get('/users/validate');
      setUser(response.data.user);
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('token') && !!user;
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    isAuthenticated,
    loading
  };

  if (loading) {
    return <LoaderOverlay show label="Loading..." />;
  }

  return (
    <UserContext.Provider value={value}>
      {children}
      <LoaderOverlay show={pendingRequests > 0} />
    </UserContext.Provider>
  );
} 