import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('crm_token');
  const admin = localStorage.getItem('crm_admin');

  if (!token || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Future improvement: decode token to check expiration, 
  // but for now relying on backend 401s for explicit invalidation works too.
  
  return children;
};

export default AdminProtectedRoute;
