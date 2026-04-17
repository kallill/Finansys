import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Componente que protege rotas internas.
 * Se o token nÃƒÆ’Ã‚Â£o for encontrado no localStorage, redireciona o usuÃƒÆ’Ã‚Â¡rio para o Login.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redireciona para login se nÃƒÆ’Ã‚Â£o houver token
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;