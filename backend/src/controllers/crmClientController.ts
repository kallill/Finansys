import { Request, Response } from 'express';
import { CRMCliente, CRMAssinatura, CRMPlano } from '../models';

/** Lista todos os clientes com seus planos ativos */
export const getClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await CRMCliente.findAll({
      include: [{
        model: CRMAssinatura,
        as: 'assinaturas',
        include: [{ model: CRMPlano, as: 'plano' }]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(clients);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ message: 'Erro ao listar clientes.' });
  }
};

/** Cria um novo cliente */
export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, telefone, documento, tipo_pessoa } = req.body;
    const client = await CRMCliente.create({ nome, email, telefone, documento, tipo_pessoa });
    res.status(201).json(client);
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ message: 'Email ou documento ja cadastrado.' });
    } else {
      res.status(500).json({ message: 'Erro ao criar cliente.' });
    }
  }
};

/** Atualiza dados de um cliente */
export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, documento, tipo_pessoa } = req.body;
    const client = await CRMCliente.findByPk(id);
    if (!client) { res.status(404).json({ message: 'Cliente nao encontrado.' }); return; }
    await client.update({ nome, email, telefone, documento, tipo_pessoa });
    res.json(client);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro ao atualizar cliente.' });
  }
};

/** Remove um cliente */
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await CRMCliente.destroy({ where: { id } });
    res.json({ success: true, message: 'Cliente removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ message: 'Erro ao excluir cliente.' });
  }
};
