import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { summary } from '../controllers/walletController';

const router = Router();

router.get('/summary', authMiddleware, summary);

export default router;
