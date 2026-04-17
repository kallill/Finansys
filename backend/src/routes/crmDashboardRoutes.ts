import express from 'express';
import { getStats } from '../controllers/crmDashboardController';
import { checkCrmAuth } from '../middlewares/crmAuthMiddleware';

const router = express.Router();

// Todas as rotas de Dashboard exigem autenticação de Admin
router.get('/stats', checkCrmAuth, getStats);

export default router;
