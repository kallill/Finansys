import express from 'express';
import { getSubscriptions, createSubscription, updateSubscription, deleteSubscription } from '../controllers/crmFinancialController';
import { checkCrmAuth } from '../middlewares/crmAuthMiddleware';

const router = express.Router();

// Todas as rotas Financeiras exigem autenticacao de Admin CRM
router.get('/', checkCrmAuth, getSubscriptions);
router.post('/', checkCrmAuth, createSubscription);
router.put('/:id', checkCrmAuth, updateSubscription);
router.delete('/:id', checkCrmAuth, deleteSubscription);

export default router;
