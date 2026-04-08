import { Router } from 'express';
import { webhookCreateTransaction } from '../controllers/webhookController';

const router = Router();

// Endpoint webhook que n8n vai chamar para registrar transações do bot
router.post('/transaction', webhookCreateTransaction);

export default router;
