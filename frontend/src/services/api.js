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
    const message = error?.response?.data?.message || 'Falha ao autenticar';
    const e = new Error(message);
    e.response = error?.response;
    throw e;
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

export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPassword = async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/user/profile');
    return response.data;
};

export const updateProfile = async (payload) => {
    const response = await api.put('/user/profile', payload);
    return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
    const response = await api.post('/user/change-password', { currentPassword, newPassword });
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

export const createTransaction = async (payload) => {
    const response = await api.post('/transactions', payload);
    return response.data;
};

export const updateTransaction = async (id, payload) => {
    const response = await api.put(`/transactions/${id}`, payload);
    return response.data;
};

export const deleteTransaction = async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
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

export const getDashboardSeries = async () => {
    try {
        const response = await api.get('/dashboard/series');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar séries:", error);
        return { series: [] };
    }
};

export const getWalletSummary = async () => {
    const response = await api.get('/wallet/summary');
    return response.data;
};

export const getReportTransactions = async (params) => {
    const response = await api.get('/reports/transactions', { params });
    return response.data;
};

export default api;
