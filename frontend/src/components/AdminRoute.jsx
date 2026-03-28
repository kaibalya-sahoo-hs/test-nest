import React from 'react';
import { Navigate } from 'react-router';
import toast from 'react-hot-toast';

function AdminRoute({ children }) {
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  if (!user) {
    toast.error('Please login first');
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    toast.error('Admin access required');
    return <Navigate to="/profile" replace />;
  }

  return children;
}

export default AdminRoute;
