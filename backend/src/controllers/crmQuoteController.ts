import { Request, Response } from 'express';
import { CRMOrcamento, CRMCliente } from '../models';

class CRMQuoteController {
  public async list(req: Request, res: Response) {
    try {
      const quotes = await CRMOrcamento.findAll({
        include: [{ model: CRMCliente, as: 'cliente', attributes: ['nome_fantasia', 'razao_social'] }],
        order: [['createdAt', 'DESC']]
      });
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao listar orçamentos' });
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const quote = await CRMOrcamento.create(req.body);
      res.status(201).json(quote);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar orçamento' });
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CRMOrcamento.update(req.body, { where: { id } });
      res.json({ message: 'Orçamento atualizado' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar orçamento' });
    }
  }

  public async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CRMOrcamento.destroy({ where: { id } });
      res.json({ message: 'Orçamento removido' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao deletar orçamento' });
    }
  }

  public async getStats(req: Request, res: Response) {
    try {
      const quotes = await CRMOrcamento.findAll();
      const stats = {
        total_ofertado: quotes.reduce((acc, q) => acc + Number(q.total_ofertado), 0),
        total_tabela: quotes.reduce((acc, q) => acc + Number(q.total_tabela), 0),
        count: quotes.length,
        desconto_total: quotes.reduce((acc, q) => acc + (Number(q.total_tabela) - Number(q.total_ofertado)), 0)
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar estatísticas' });
    }
  }
}

export default new CRMQuoteController();
