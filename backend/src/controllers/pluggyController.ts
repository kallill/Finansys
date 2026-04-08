import { Request, Response } from 'express';
import pluggyService from '../services/pluggyService';

export const getConnectToken = async (req: Request, res: Response) => {
  try {
    const token = await pluggyService.getConnectToken();
    res.json({ accessToken: token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
