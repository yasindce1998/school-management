import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const PrivateRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, currentUser, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && (!currentUser || currentUser.role !== requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
