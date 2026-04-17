import { Router } from 'express';
import { webhookCreateTransaction, webhookAgent, pluggyWebhook } from '../controllers/webhookController';

const router = Router();

// Endpoint webhook que n8n vai chamar para registrar transaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âµes do bot
router.post('/transaction', webhookCreateTransaction);
router.post('/agent', webhookAgent);

// Webhook oficial da Pluggy para sincronismo do Open Finance
router.post('/pluggy', pluggyWebhook);

export default router;