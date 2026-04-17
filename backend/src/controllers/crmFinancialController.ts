import { Request, Response } from 'express';
import { CRMAssinatura, CRMCliente, CRMPlano } from '../models';

/** Lista todas as assinaturas com dados de cliente e plano (visao Financeiro) */
export const getSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const assinaturas = await CRMAssinatura.findAll({
      include: [
        { model: CRMCliente, as: 'cliente', attributes: ['id', 'nome', 'email'] },
        { model: CRMPlano, as: 'plano', attributes: ['id', 'nome', 'valor'] }
      ],
      order: [['data_vencimento', 'ASC']]
    });
    res.json(assinaturas);
  } catch (error) {
    console.error('Erro ao listar assinaturas:', error);
    res.status(500).json({ message: 'Erro ao listar assinaturas.' });
  }
};

/** Cria uma nova assinatura vinculando cliente a plano */
export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cliente_id, plano_id, data_vencimento, status_pagamento } = req.body;
    const assinatura = await CRMAssinatura.create({
      cliente_id,
      plano_id,
      data_vencimento,
      status_pagamento: status_pagamento || 'Ativo'
    });
    res.status(201).json(assinatura);
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    res.status(500).json({ message: 'Erro ao criar assinatura.' });
  }
};

/** Atualiza status de pagamento de uma assinatura */
export const updateSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status_pagamento, data_vencimento, plano_id } = req.body;
    const assinatura = await CRMAssinatura.findByPk(id);
    if (!assinatura) { res.status(404).json({ message: 'Assinatura nao encontrada.' }); return; }
    await assinatura.update({ status_pagamento, data_vencimento, plano_id });
    res.json(assinatura);
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    res.status(500).json({ message: 'Erro ao atualizar assinatura.' });
  }
};

/** Remove uma assinatura */
export const deleteSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await CRMAssinatura.destroy({ where: { id } });
    res.json({ success: true, message: 'Assinatura removida.' });
  } catch (error) {
    console.error('Erro ao excluir assinatura:', error);
    res.status(500).json({ message: 'Erro ao excluir assinatura.' });
  }
};
