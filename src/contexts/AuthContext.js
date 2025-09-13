import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
    }
  }, [token]);

  // Check if user is logged in on app load
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          if (response.data.success !== false) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.token) {
        const { token, ...userData } = response.data;
        
        localStorage.setItem('token', token);
        setToken(token);
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      } else {
        return { success: false, message: 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);

      if (response.data.token) {
        const { token, ...userInfo } = response.data;
        
        localStorage.setItem('token', token);
        setToken(token);
        setUser(userInfo);
        setIsAuthenticated(true);
        
        return { success: true, user: userInfo };
      } else {
        return { success: false, message: 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshToken = async () => {
    try {
      if (!token) return false;
      
      const response = await axios.post('/api/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.token) {
        const { token: newToken, ...userData } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
