import { Request, Response } from 'express';
import { User } from '../models';
import bcrypt from 'bcryptjs';

interface AuthRequest extends Request {
  user?: { id: number };
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, isVerified: user.isVerified });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { name, email } = req.body;
    user.name = name ?? user.name;
    user.email = email ?? user.email;
    await user.save();
    res.json({ id: user.id, name: user.name, email: user.email, isVerified: user.isVerified });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { currentPassword, newPassword } = req.body;
    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password changed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
