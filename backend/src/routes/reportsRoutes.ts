import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { transactionsReport } from '../controllers/reportsController';

const router = Router();

router.get('/transactions', authMiddleware, transactionsReport);

export default router;
