import { Router } from 'express';
import * as whatsappController from '../controllers/whatsappController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rotas Protegidas (Dashboard/Perfil)
router.get('/status', authMiddleware, whatsappController.getStatus);
router.get('/connect', authMiddleware, whatsappController.connect);
router.post('/logout', authMiddleware, whatsappController.logout);

// Rota PÃºblica (Webhook da Evolution API)
// Essa rota deve ser configurada na Evolution para receber eventos de pairing
router.post('/webhook/evolution', whatsappController.handleEvolutionWebhook);

export default router;
