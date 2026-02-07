import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getProfile, updateProfile, changePassword } from '../controllers/userController';

const router = Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/change-password', authMiddleware, changePassword);

export default router;
