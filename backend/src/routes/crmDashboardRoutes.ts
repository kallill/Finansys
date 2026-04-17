import express from 'express';
import { getStats } from '../controllers/crmDashboardController';
import { checkCrmAuth } from '../middlewares/crmAuthMiddleware';

const router = express.Router();

// Todas as rotas de Dashboard exigem autenticaÃ§Ã£o de Admin
router.get('/stats', checkCrmAuth, getStats);

export default router;
