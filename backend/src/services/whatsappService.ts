import axios from 'axios';

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'https://evolution.dksystem.online';
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
   * Verifica o status de uma instÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ncia
   */
  async getStatus(instanceName: string) {
    try {
      // Usamos fetchInstances para pegar o ownerJid se estiver open
      const response = await api.get('/instance/fetchInstances');
      const instance = response.data.find((ins: any) => ins.name === instanceName);
      
      if (!instance) return { instance: { state: 'not_found' } };
      
      return { 
        instance: { 
          state: instance.connectionStatus,
          ownerJid: instance.ownerJid
        } 
      };
    } catch (error: any) {
      console.error(`[Evolution API Error] Status ${instanceName}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Cria uma nova instÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ncia se nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o existir
   */
  async createInstance(instanceName: string) {
    const integrations = ["WHATSAPP-BAILEYS", "baileys", "whatsapp-baileys"];
    let lastError = null;

    for (const integration of integrations) {
      try {
        console.log(`[WhatsApp] Tentando criar instÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ncia ${instanceName} com integraÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o: ${integration}`);
        const response = await api.post('/instance/create', {
          instanceName,
          qrcode: true,
          integration: integration
        });
        return response.data;
      } catch (error: any) {
        lastError = error.response?.data || error.message;
        if (error.response?.status === 403 || lastError?.message?.includes('already exists')) {
          return { message: 'Instance already exists' };
        }
        // Se for erro de integraÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o, tenta a prÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³xima
        if (lastError?.message?.includes('integration')) {
          continue;
        }
        throw error;
      }
    }
    
    // Se chegou aqui, tenta sem o campo integration (ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºltimo recurso)
    try {
      const response = await api.post('/instance/create', { instanceName, qrcode: true });
      return response.data;
    } catch (e: any) {
      console.error(`[Evolution API Error] Todas as tentativas falharam para ${instanceName}:`, lastError);
      throw e;
    }
  },

  /**
   * ObtÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©m o QR Code para pareamento
   */
  async getQRCode(instanceName: string) {
    // Verifica status antes para evitar erro 500 se jÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡ estiver conectado
    try {
      const status = await this.getStatus(instanceName);
      if (status.instance?.state === 'open') {
        return { message: 'Already connected', connected: true };
      }
    } catch (e) {
      // Ignora erro de status e tenta criar/conectar
    }

    // Garante que a instÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ncia existe
    await this.createInstance(instanceName);
    
    // Busca o QR Code
    const response = await api.get(`/instance/connect/${instanceName}`);
    return response.data;
  },

  /**
   * Configura a Webhook da instÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ncia para o n8n
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
   * Encerra a sessÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
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