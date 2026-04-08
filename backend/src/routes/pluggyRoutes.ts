import { Router } from 'express';
import { getConnectToken } from '../controllers/pluggyController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint que vai fornecer o token pro Frontend (protegido por Autenticação)
router.get('/token', authMiddleware, getConnectToken);

export default router;
