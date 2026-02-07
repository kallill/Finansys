import { Router } from 'express';
import { health } from '../controllers/healthController';

const router = Router();

router.get('/db', health);

export default router;
