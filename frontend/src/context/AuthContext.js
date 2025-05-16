import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const data = await AuthService.login({ username, password });
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout,
    hasRole: (role) => currentUser && currentUser.role === role
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
