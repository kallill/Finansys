import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Componente que protege rotas internas.
 * Se o token nÃ£o for encontrado no localStorage, redireciona o usuÃ¡rio para o Login.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redireciona para login se nÃ£o houver token
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
