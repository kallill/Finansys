import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Usa URL relativa em produção
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    if (!error.response || (error.response && error.response.status >= 500)) {
         console.warn("Backend indisponível. Usando modo offline/demo.");
         const mockUser = { name: 'Usuário Demo', email };
         localStorage.setItem('token', 'demo-token');
         localStorage.setItem('user', JSON.stringify(mockUser));
         return { user: mockUser, token: 'demo-token' };
    }
    throw error;
  }
};

export const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
};

export const verifyEmailToken = async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
};

export const getTransactions = async () => {
    try {
        const response = await api.get('/transactions');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar transações:", error);
        return [];
    }
};

export const getDashboardStats = async () => {
    try {
        const response = await api.get('/dashboard/stats');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        return null;
    }
};

export default api;
