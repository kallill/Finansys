import { Router } from 'express';
import { listCreditCards, createCreditCard, updateCreditCard, deleteCreditCard } from '../controllers/creditCardController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listCreditCards);
router.post('/', createCreditCard);
router.put('/:id', updateCreditCard);
router.delete('/:id', deleteCreditCard);

export default router;
