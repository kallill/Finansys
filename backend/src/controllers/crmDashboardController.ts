import { Request, Response } from 'express';
import { CRMCliente, CRMAssinatura, CRMPlano, CRMOrdemServico } from '../models';
import { Op } from 'sequelize';

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Contagem de Clientes Ativos
    const activeClients = await CRMCliente.count();

    // 2. Calculo do MRR (Soma dos valores dos planos de todas as assinaturas ativas)
    const assinaturas = await CRMAssinatura.findAll({
      include: [{ model: CRMPlano, as: 'plano' }]
    });

    const totalMRR = assinaturas.reduce((acc, current: any) => {
      return acc + (Number(current.plano?.valor) || 0);
    }, 0);

    // 3. Calculo de Inadimplencia (Soma dos valores das assinaturas com status 'Atrasado')
    const totalInadimplencia = assinaturas
      .filter((s: any) => s.status_pagamento === 'Atrasado')
      .reduce((acc, current: any) => {
        return acc + (Number(current.plano?.valor) || 0);
      }, 0);

    // 4. Ordens de Servico Abertas (Status != 'Concluida')
    const openOS = await CRMOrdemServico.count({
      where: {
        status: {
          [Op.ne]: 'Concluida'
        }
      }
    });

    // 5. Dados para o grafico (Mockando historico baseado no MRR atual para visualizacao)
    const mrrHistory = [
      { name: 'Jan', mrr: totalMRR * 0.8 },
      { name: 'Fev', mrr: totalMRR * 0.85 },
      { name: 'Mar', mrr: totalMRR * 0.9 },
      { name: 'Abr', mrr: totalMRR }
    ];

    res.json({
      success: true,
      stats: {
        mrr: totalMRR,
        clients: activeClients,
        inadimplencia: totalInadimplencia,
        openOS: openOS
      },
      history: mrrHistory
    });

  } catch (error) {
    console.error('Erro ao buscar estatisticas do dashboard:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar dados do dashboard.' });
  }
};