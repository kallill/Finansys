import { Router } from 'express';
import { getConnectToken, updatePluggyItemId } from '../controllers/pluggyController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint que vai fornecer o token pro Frontend (protegido por AutenticaÃƒÂ§ÃƒÂ£o)
router.get('/token', authMiddleware, getConnectToken);

// Salva o itemId retornado pelo widget na conta do usuÃƒÂ¡rio
router.post('/item', authMiddleware, updatePluggyItemId);

export default router;
