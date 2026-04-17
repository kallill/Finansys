import { Router } from 'express';
import { getConnectToken, updatePluggyItemId } from '../controllers/pluggyController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint que vai fornecer o token pro Frontend (protegido por AutenticaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o)
router.get('/token', authMiddleware, getConnectToken);

// Salva o itemId retornado pelo widget na conta do usuÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡rio
router.post('/item', authMiddleware, updatePluggyItemId);

export default router;