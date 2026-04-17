import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Componente que protege rotas internas.
 * Se o token nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o for encontrado no localStorage, redireciona o usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio para o Login.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redireciona para login se nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o houver token
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;