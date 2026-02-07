import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { listTransactions, createTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionController';

const router = Router();

router.get('/', authMiddleware, listTransactions);
router.post('/', authMiddleware, createTransaction);
router.put('/:id', authMiddleware, updateTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);

export default router;
