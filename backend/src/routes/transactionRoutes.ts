import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { listTransactions, createTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionController';
import { importStatement, confirmImport } from '../controllers/importController';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get('/', authMiddleware, listTransactions);
router.post('/', authMiddleware, createTransaction);
router.put('/:id', authMiddleware, updateTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);

// Rotas de ImportaÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o
router.post('/import', [authMiddleware, upload.single('file')], importStatement);
router.post('/confirm-import', authMiddleware, confirmImport);

export default router;