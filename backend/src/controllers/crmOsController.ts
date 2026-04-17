import { Request, Response } from 'express';
import { CRMOrdemServico, CRMAnexoOS } from '../models';

export const uploadAnexo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // ID da OS
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: 'Nenhum arquivo recebido ou formato invÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡lido.' });
      return;
    }

    const os = await CRMOrdemServico.findByPk(id as string);
    if (!os) {
      res.status(404).json({ success: false, message: 'Ordem de serviÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§o nÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o encontrada.' });
      return;
    }

    // Como o multer salvou na pasta local exposta pelo nginx, o caminho pÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºblico serÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡:
    // https://cerasus.com.br/uploads/os/filename.ext
    const fileUrl = `/uploads/os/${file.filename}`;
    const tipo = file.mimetype.startsWith('image/') ? 'imagem' : 'pdf';

    const anexo = await CRMAnexoOS.create({
      os_id: os.id,
      url_arquivo: fileUrl,
      tipo
    });

    res.json({
      success: true,
      anexo
    });

  } catch (error) {
    console.error('Erro no upload de anexo da OS:', error);
    res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};