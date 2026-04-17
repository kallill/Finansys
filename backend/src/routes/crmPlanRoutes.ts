import express from 'express';
import { getPlans, createPlan, updatePlan, deletePlan } from '../controllers/crmPlanController';
import { checkCrmAuth } from '../middlewares/crmAuthMiddleware';

const router = express.Router();

// Todas as rotas de Planos exigem autenticaÃ§Ã£o de Admin
router.get('/', checkCrmAuth, getPlans);
router.post('/', checkCrmAuth, createPlan);
router.put('/:id', checkCrmAuth, updatePlan);
router.delete('/:id', checkCrmAuth, deletePlan);

export default router;
