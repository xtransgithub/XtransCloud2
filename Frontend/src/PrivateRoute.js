import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Get JWT token from localStorage
  
  if (!token) {
    return <Navigate to="/signin" />; // Redirect to login page if not authenticated
  }

  return children; // If authenticated, allow access to the page
};

export default PrivateRoute;
