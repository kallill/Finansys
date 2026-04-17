import express from 'express';
import { getClients, createClient, updateClient, deleteClient } from '../controllers/crmClientController';
import { checkCrmAuth } from '../middlewares/crmAuthMiddleware';

const router = express.Router();

// Todas as rotas de Clientes exigem autenticacao de Admin CRM
router.get('/', checkCrmAuth, getClients);
router.post('/', checkCrmAuth, createClient);
router.put('/:id', checkCrmAuth, updateClient);
router.delete('/:id', checkCrmAuth, deleteClient);

export default router;
