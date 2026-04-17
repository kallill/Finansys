import express from 'express';
import { loginAdmin, getAdmins, createAdmin, deleteAdmin, updateProfile } from '../controllers/crmAuthController';
import { checkCrmAuth } from '../middlewares/crmAuthMiddleware';

const router = express.Router();

router.post('/login', loginAdmin);

// Rotas protegidas por autenticaÃ§Ã£o de Admin
router.get('/me', checkCrmAuth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

router.get('/admins', checkCrmAuth, getAdmins);
router.post('/admins', checkCrmAuth, createAdmin);
router.delete('/admins/:id', checkCrmAuth, deleteAdmin);
router.put('/profile', checkCrmAuth, updateProfile);

export default router;
