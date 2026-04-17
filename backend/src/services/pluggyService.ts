import { PluggyClient } from 'pluggy-sdk';

class PluggyService {
  private client: PluggyClient;

  constructor() {
    const clientId = process.env.PLUGGY_CLIENT_ID || '';
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET || '';

    if (!clientId || !clientSecret) {
      console.warn('ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â PLUGGY_CLIENT_ID ou PLUGGY_CLIENT_SECRET ausentes no arquivo .env');
    }

    this.client = new PluggyClient({
      clientId,
      clientSecret,
    });
  }

  /**
   * Gera um Connect Token descartÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡vel, usado no Frontend para abrir o Widget de forma segura.
   * Ele expira rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡pido pela seguranÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§a do Banco Central.
   */
  public async getConnectToken(userId: number): Promise<string> {
    try {
      const tokenResponse = await this.client.createConnectToken(undefined, {
        clientUserId: `finansys_user_${userId}`
      });
      return tokenResponse.accessToken;
    } catch (error: any) {
      console.error('Falha ao gerar Token de ConexÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o Pluggy:', error?.message);
      throw new Error('Falha na comunicaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o segura com a API do Open Finance.');
    }
  }

  // VocÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª pode expor o client se quiser para mÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©todos customizados, mas ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© legal encapsular.
  public getClient(): PluggyClient {
    return this.client;
  }
}

export default new PluggyService();