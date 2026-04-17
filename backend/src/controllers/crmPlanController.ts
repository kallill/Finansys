import { Request, Response } from 'express';
import { CRMPlano } from '../models';

export const getPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await CRMPlano.findAll({
      order: [['valor', 'ASC']]
    });
    res.json(plans);
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    res.status(500).json({ message: 'Erro ao listar planos.' });
  }
};

export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, valor, recursos_inclusos } = req.body;
    
    const plan = await CRMPlano.create({
      nome,
      valor,
      recursos_inclusos: recursos_inclusos || []
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error('Erro ao criar plano:', error);
    res.status(500).json({ message: 'Erro ao criar plano.' });
  }
};

export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const planId = String(req.params.id);
    const { nome, valor, recursos_inclusos } = req.body;

    const plan = await CRMPlano.findByPk(planId);
    if (!plan) {
      res.status(404).json({ message: 'Plano nÃƒÂ£o encontrado.' });
      return;
    }

    await plan.update({
      nome: nome || plan.nome,
      valor: valor || plan.valor,
      recursos_inclusos: recursos_inclusos || plan.recursos_inclusos
    });

    res.json(plan);
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({ message: 'Erro ao atualizar plano.' });
  }
};

export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const planId = String(req.params.id);
    await CRMPlano.destroy({ where: { id: planId } });
    res.json({ success: true, message: 'Plano excluÃƒÂ­do com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir plano:', error);
    res.status(500).json({ message: 'Erro ao excluir plano.' });
  }
};
