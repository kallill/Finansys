import { Router } from 'express';
import { webhookCreateTransaction, webhookAgent } from '../controllers/webhookController';

const router = Router();

// Endpoint webhook que n8n vai chamar para registrar transações do bot
router.post('/transaction', webhookCreateTransaction);
router.post('/agent', webhookAgent);

export default router;
