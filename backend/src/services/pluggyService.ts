import { PluggyClient } from 'pluggy-sdk';

class PluggyService {
  private client: PluggyClient;

  constructor() {
    const clientId = process.env.PLUGGY_CLIENT_ID || '';
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET || '';

    if (!clientId || !clientSecret) {
      console.warn('⚠️ PLUGGY_CLIENT_ID ou PLUGGY_CLIENT_SECRET ausentes no arquivo .env');
    }

    this.client = new PluggyClient({
      clientId,
      clientSecret,
    });
  }

  /**
   * Gera um Connect Token descartável, usado no Frontend para abrir o Widget de forma segura.
   * Ele expira rápido pela segurança do Banco Central.
   */
  public async getConnectToken(userId: number): Promise<string> {
    try {
      const tokenResponse = await this.client.createConnectToken(undefined, {
        clientUserId: `finansys_user_${userId}`
      });
      return tokenResponse.accessToken;
    } catch (error: any) {
      console.error('Falha ao gerar Token de Conexão Pluggy:', error?.message);
      throw new Error('Falha na comunicação segura com a API do Open Finance.');
    }
  }

  // Você pode expor o client se quiser para métodos customizados, mas é legal encapsular.
  public getClient(): PluggyClient {
    return this.client;
  }
}

export default new PluggyService();
