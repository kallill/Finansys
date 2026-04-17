import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Usa URL relativa em produÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
});

// Interceptor para adicionar token em todas as requisiÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes
api.interceptors.request.use((config) => {
  // Prioriza o crm_token se a rota for de CRM, caso contrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio usa o token padrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
  const crmToken = localStorage.getItem('crm_token');
  const token = localStorage.getItem('token');
  
  if (config.url.includes('/crm') && crmToken) {
    config.headers.Authorization = `Bearer ${crmToken}`;
  } else if (token) {
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
        console.error("Erro ao buscar transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes:", error);
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
        console.error("Erro ao buscar estatÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­sticas:", error);
        return null;
    }
};

export const getDashboardSeries = async () => {
    try {
        const response = await api.get('/dashboard/series');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar sÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©ries:", error);
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

export const getPluggyConnectToken = async () => {
    const response = await api.get('/pluggy/connect-token');
    return response.data.accessToken;
};

// --- NOVAS ROTAS DE IMPORTAÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢O ---
export const importBankStatement = async (formData) => {
    const response = await api.post('/transactions/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const confirmBankImport = async (transactions) => {
    const response = await api.post('/transactions/confirm-import', { transactions });
    return response.data;
};

export const savePluggyItemId = async (itemId) => {
    try {
        const response = await api.post('/pluggy/item', { itemId });
        return response.data;
    } catch (error) {
        console.error("Erro ao salvar ID da conexÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o Pluggy", error);
        throw error;
    }
};

// --- Credit Cards ---
export const getCreditCards = async () => {
    const response = await api.get('/credit-cards');
    return response.data.creditCards || [];
};

export const createCreditCard = async (payload) => {
    const response = await api.post('/credit-cards', payload);
    return response.data.creditCard;
};

export const updateCreditCard = async (id, payload) => {
    const response = await api.put(`/credit-cards/${id}`, payload);
    return response.data.creditCard;
};

export const deleteCreditCard = async (id) => {
    const response = await api.delete(`/credit-cards/${id}`);
    return response.data;
};

// --- WhatsApp ---
export const getWhatsAppStatus = async () => {
    const response = await api.get('/whatsapp/status');
    return response.data;
};

export const getWhatsAppQRCode = async () => {
    const response = await api.get('/whatsapp/connect');
    return response.data;
};

export const logoutWhatsApp = async () => {
    const response = await api.post('/whatsapp/logout');
    return response.data;
};

export default api;