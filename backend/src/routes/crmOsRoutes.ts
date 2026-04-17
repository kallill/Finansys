import express from 'express';
import multer from 'multer';
import path from 'path';
import { getOS, createOS, updateStatus, uploadAnexo } from '../controllers/crmOsController';
import { checkCrmAuth } from '../middlewares/crmAuthMiddleware';

const router = express.Router();

// Configuração do Multer para Uploads de OS
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public_html/uploads/os');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'os-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // limite 5MB
});

// Todas as rotas de OS exigem autenticacao
router.get('/', checkCrmAuth, getOS);
router.post('/', checkCrmAuth, createOS);
router.put('/:id/status', checkCrmAuth, updateStatus);
router.post('/:id/upload', checkCrmAuth, upload.single('anexo'), uploadAnexo);

export default router;
