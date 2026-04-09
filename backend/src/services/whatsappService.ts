import axios from 'axios';

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'http://evolution:8080';
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || 'B39CA8B62C05DA3CD778A9C1DE4DAB37';

const api = axios.create({
  baseURL: EVOLUTION_URL,
  headers: {
    apikey: EVOLUTION_KEY,
    'Content-Type': 'application/json'
  }
});

export const whatsappService = {
  /**
   * Verifica o status de uma instância
   */
  async getStatus(instanceName: string) {
    try {
      const response = await api.get(`/instance/connectionState/${instanceName}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return { instance: { state: 'not_found' } };
      throw error;
    }
  },

  /**
   * Cria uma nova instância se não existir
   */
  async createInstance(instanceName: string) {
    try {
      const response = await api.post('/instance/create', {
        instanceName,
        qrcode: true,
        token: Math.random().toString(36).substring(7)
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.data?.message?.includes('already exists')) {
        return { message: 'Instance already exists' };
      }
      throw error;
    }
  },

  /**
   * Obtém o QR Code para pareamento
   */
  async getQRCode(instanceName: string) {
    // Garante que a instância existe
    await this.createInstance(instanceName);
    
    // Busca o QR Code
    const response = await api.get(`/instance/connect/${instanceName}`);
    return response.data;
  },

  /**
   * Configura a Webhook da instância para o n8n
   */
  async setWebhook(instanceName: string, webhookUrl: string) {
    try {
      const response = await api.post(`/webhook/set/${instanceName}`, {
        url: webhookUrl,
        enabled: true,
        webhook_by_events: false, // Envia todos os eventos para simplificar
        events: [
          "MESSAGES_UPSERT",
          "CONNECTION_UPDATE"
        ]
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao configurar webhook para ${instanceName}:`, error);
      return null;
    }
  },

  /**
   * Encerra a sessão
   */
  async logout(instanceName: string) {
    try {
      await api.delete(`/instance/logout/${instanceName}`);
      await api.delete(`/instance/delete/${instanceName}`);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
};

export default whatsappService;
