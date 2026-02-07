import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { sendVerificationEmail, sendResetPasswordEmail } from '../services/emailService';
import crypto from 'crypto';
import { Op } from 'sequelize';

export const register = async (req: Request, res: Response) => {
  try {
    let { name, email, password } = req.body;
    if (typeof email === 'string') email = email.trim().toLowerCase();
    if (typeof name === 'string') name = name.trim();

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password_hash,
      isVerified: false,
      verificationToken
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // We can choose to login immediately or ask for verification first
    // Here we return token but user is not verified yet
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });

    res.status(201).json({
      message: 'User created. Please check your email to verify account.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: false
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.body; // or req.query depending on how we handle it

        const user = await User.findOne({ where: { verificationToken: token } });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.isVerified = true;
        user.verificationToken = null; // Clear token
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const login = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;
    if (typeof email === 'string') email = email.trim().toLowerCase();

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.warn('Login failed: user not found', { email });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.warn('Login failed: bad password', { email, userId: user.id });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    if (user) {
      user.resetPasswordToken = token;
      user.resetPasswordExpires = expires;
      await user.save();
      await sendResetPasswordEmail(email, token);
    }
    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() }
      }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    user.password_hash = password_hash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
