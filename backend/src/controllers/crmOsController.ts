import { Request, Response } from 'express';
import { CRMOrdemServico, CRMAnexoOS, CRMCliente } from '../models';

/** Lista todas as Ordens de Servico abertas */
export const getOS = async (req: Request, res: Response): Promise<void> => {
  try {
    const ordens = await CRMOrdemServico.findAll({
      include: [
        { model: CRMCliente, as: 'cliente', attributes: ['id', 'nome'] },
        { model: CRMAnexoOS, as: 'anexos' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(ordens);
  } catch (error) {
    console.error('Erro ao listar OS:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar ordens de servico.' });
  }
};

/** Cria uma nova Ordem de Servico */
export const createOS = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cliente_id, descricao } = req.body;
    const os = await CRMOrdemServico.create({
      cliente_id,
      descricao,
      status: 'Em Andamento'
    });
    res.status(201).json(os);
  } catch (error) {
    console.error('Erro ao criar OS:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar ordem de servico.' });
  }
};

/** Atualiza o status de uma OS */
export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const os = await CRMOrdemServico.findByPk(id);
    if (!os) {
      res.status(404).json({ success: false, message: 'OS nao encontrada.' });
      return;
    }
    await os.update({ status });
    res.json(os);
  } catch (error) {
    console.error('Erro ao atualizar status da OS:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar status.' });
  }
};

/** Sobe um anexo para uma OS */
export const uploadAnexo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: 'Arquivo nao recebido.' });
      return;
    }

    const os = await CRMOrdemServico.findByPk(id);
    if (!os) {
      res.status(404).json({ success: false, message: 'OS nao encontrada.' });
      return;
    }

    const fileUrl = `/uploads/os/${file.filename}`;
    const tipo = file.mimetype.startsWith('image/') ? 'imagem' : 'pdf';

    const anexo = await CRMAnexoOS.create({
      os_id: os.id,
      url_arquivo: fileUrl,
      tipo
    });

    res.json({ success: true, anexo });
  } catch (error) {
    console.error('Erro no upload de anexo da OS:', error);
    res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};