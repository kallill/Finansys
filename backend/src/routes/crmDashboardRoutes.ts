import express from 'express';
import { getStats } from '../controllers/crmDashboardController';
import { checkCrmAuth } from '../middlewares/crmAuthMiddleware';

const router = express.Router();

// Todas as rotas de Dashboard exigem autenticaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o de Admin
router.get('/stats', checkCrmAuth, getStats);

export default router;