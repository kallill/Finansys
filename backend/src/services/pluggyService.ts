import { PluggyClient } from 'pluggy-sdk';

class PluggyService {
  private client: PluggyClient;

  constructor() {
    const clientId = process.env.PLUGGY_CLIENT_ID || '';
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET || '';

    if (!clientId || !clientSecret) {
      console.warn('âš ï¸ PLUGGY_CLIENT_ID ou PLUGGY_CLIENT_SECRET ausentes no arquivo .env');
    }

    this.client = new PluggyClient({
      clientId,
      clientSecret,
    });
  }

  /**
   * Gera um Connect Token descartÃ¡vel, usado no Frontend para abrir o Widget de forma segura.
   * Ele expira rÃ¡pido pela seguranÃ§a do Banco Central.
   */
  public async getConnectToken(userId: number): Promise<string> {
    try {
      const tokenResponse = await this.client.createConnectToken(undefined, {
        clientUserId: `finansys_user_${userId}`
      });
      return tokenResponse.accessToken;
    } catch (error: any) {
      console.error('Falha ao gerar Token de ConexÃ£o Pluggy:', error?.message);
      throw new Error('Falha na comunicaÃ§Ã£o segura com a API do Open Finance.');
    }
  }

  // VocÃª pode expor o client se quiser para mÃ©todos customizados, mas Ã© legal encapsular.
  public getClient(): PluggyClient {
    return this.client;
  }
}

export default new PluggyService();
