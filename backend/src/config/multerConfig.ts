import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crie a pasta se não existir (apontando para uma pasta que Nginx possa expor depois, ex: public_html/uploads)
const uploadDir = path.resolve(__dirname, '../../../../public_html/uploads/os');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo inválido. Apenas imagens e PDFs são permitidos.'));
  }
};

const uploadOS = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default uploadOS;
