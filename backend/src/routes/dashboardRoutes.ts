import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getStats, getSeries } from '../controllers/dashboardController';

const router = Router();

router.get('/stats', authMiddleware, getStats);
router.get('/series', authMiddleware, getSeries);

export default router;
