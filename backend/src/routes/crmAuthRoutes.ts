import express from 'express';
import { loginAdmin } from '../controllers/crmAuthController';
import { checkCrmAuth } from '../middlewares/crmAuthMiddleware';

const router = express.Router();

router.post('/login', loginAdmin);

// Test route to verify token
router.get('/me', checkCrmAuth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

export default router;
