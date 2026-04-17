import { Response } from 'express';
import pluggyService from '../services/pluggyService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { User } from '../models';

export const getConnectToken = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Desconectado" });

    const token = await pluggyService.getConnectToken(userId);
    res.json({ accessToken: token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePluggyItemId = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({ message: "UserId ou ItemId ausentes." });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "UsuÃƒÂ¡rio nÃƒÂ£o encontrado." });

    user.pluggyItemId = itemId;
    await user.save();

    res.json({ status: "success", message: "ConexÃƒÂ£o bancÃƒÂ¡ria vinculada com sucesso." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
