import { Router } from 'express';
import crmQuoteController from '../controllers/crmQuoteController';

const router = Router();

router.get('/', crmQuoteController.list);
router.post('/', crmQuoteController.create);
router.put('/:id', crmQuoteController.update);
router.delete('/:id', crmQuoteController.delete);
router.get('/stats', crmQuoteController.getStats);

export default router;
