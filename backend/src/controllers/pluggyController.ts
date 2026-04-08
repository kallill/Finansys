import { Response } from 'express';
import pluggyService from '../services/pluggyService';
import { AuthRequest } from '../middlewares/authMiddleware';

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
