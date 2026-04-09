import { Request, Response } from 'express';
import whatsappService from '../services/whatsappService';
import { User } from '../models';

interface AuthRequest extends Request {
  user?: { id: number };
}

export const getStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const instanceName = `finansys-user-${userId}`;
    const status = await whatsappService.getStatus(instanceName);
    
    res.json({
      connected: status.instance?.state === 'open',
      status: status.instance?.state
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar status' });
  }
};

export const connect = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const instanceName = `finansys-user-${userId}`;
    const qrData = await whatsappService.getQRCode(instanceName);

    // Tenta configurar o webhook automaticamente
    const n8nUrl = process.env.N8N_WA_WEBHOOK;
    if (n8nUrl) {
      await whatsappService.setWebhook(instanceName, n8nUrl);
    }

    res.json(qrData);
  } catch (error: any) {
    const errorData = error.response?.data || error.message;
    console.error('Erro ao conectar WhatsApp:', errorData);
    res.status(500).json({ 
      message: 'Erro ao gerar QR Code', 
      error: typeof errorData === 'string' ? errorData : JSON.stringify(errorData) 
    });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const instanceName = `finansys-user-${userId}`;
    await whatsappService.logout(instanceName);
    
    res.json({ message: 'Desconectado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao desconectar' });
  }
};

/**
 * Webhook recebido da Evolution para atualizar o status e capturar o número
 */
export const handleEvolutionWebhook = async (req: Request, res: Response) => {
  try {
    const { event, instance, data } = req.body;
    
    // Evento de conexão aberta
    if (event === 'CONNECTION_UPDATE' && data?.state === 'open') {
        const userId = instance.replace('finansys-user-', '');
        const jid = data.user?.id; // Formato: 5511999999999@s.whatsapp.net
        
        if (userId && jid) {
            const phone = jid.split('@')[0];
            await User.update({ phone }, { where: { id: userId } });
            console.log(`[WhatsApp Webhook] Usuário ${userId} conectou com o número ${phone}`);
        }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('[Evolution Webhook Error]', error);
    res.status(500).send('Error');
  }
};
