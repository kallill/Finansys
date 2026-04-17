import { Router } from 'express';
import { getConnectToken, updatePluggyItemId } from '../controllers/pluggyController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint que vai fornecer o token pro Frontend (protegido por AutenticaÃ§Ã£o)
router.get('/token', authMiddleware, getConnectToken);

// Salva o itemId retornado pelo widget na conta do usuÃ¡rio
router.post('/item', authMiddleware, updatePluggyItemId);

export default router;
