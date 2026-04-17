import { Router } from 'express';
import { webhookCreateTransaction, webhookAgent, pluggyWebhook } from '../controllers/webhookController';

const router = Router();

// Endpoint webhook que n8n vai chamar para registrar transaÃ§Ãµes do bot
router.post('/transaction', webhookCreateTransaction);
router.post('/agent', webhookAgent);

// Webhook oficial da Pluggy para sincronismo do Open Finance
router.post('/pluggy', pluggyWebhook);

export default router;
