import { Router } from 'express';
import * as whatsappController from '../controllers/whatsappController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Rotas Protegidas (Dashboard/Perfil)
router.get('/status', authenticateToken, whatsappController.getStatus);
router.get('/connect', authenticateToken, whatsappController.connect);
router.post('/logout', authenticateToken, whatsappController.logout);

// Rota Pública (Webhook da Evolution API)
// Essa rota deve ser configurada na Evolution para receber eventos de pairing
router.post('/webhook/evolution', whatsappController.handleEvolutionWebhook);

export default router;
