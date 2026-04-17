import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CRMAdmin } from '../models';
import svgCaptcha from 'svg-captcha';
import redis from '../config/redis';
import { v4 as uuidv4 } from 'uuid';

/**
 * Gera um desafio de Captcha visual
 */
export const getCaptcha = async (req: Request, res: Response): Promise<void> => {
  try {
    const captcha = svgCaptcha.create({
      size: 6,
      noise: 3,
      color: true,
      background: '#0a0a0a'
    });

    const captchaId = uuidv4();
    // Salva o texto do captcha no Redis por 5 minutos
    await redis.set(`crm_captcha:${captchaId}`, captcha.text.toLowerCase(), 'EX', 300);

    res.json({
      success: true,
      captchaId,
      svg: captcha.data
    });
  } catch (error) {
    console.error('Erro ao gerar captcha:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar desafio de seguranca.' });
  }
};

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, captchaId, captchaValue } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const lockoutKey = `crm_blocked:${email}:${ip}`;
    const attemptsKey = `crm_attempts:${email}:${ip}`;

    // 1. Verificar Bloqueio Ativo
    const isBlocked = await redis.get(lockoutKey);
    if (isBlocked) {
      const ttl = await redis.ttl(lockoutKey);
      res.status(403).json({ 
        success: false, 
        message: `Muitas tentativas. Aguarde ${Math.ceil(ttl / 60)} minuto(s) para tentar novamente.`,
        isBlocked: true,
        minutesRemaining: Math.ceil(ttl / 60)
      });
      return;
    }

    // 2. Validar Presenca de Credenciais e Captcha
    if (!email || !password || !captchaId || !captchaValue) {
      res.status(400).json({ success: false, message: 'E-mail, senha e captcha sao obrigatorios.' });
      return;
    }

    // 3. Validar Captcha no Redis
    const savedCaptcha = await redis.get(`crm_captcha:${captchaId}`);
    if (!savedCaptcha || savedCaptcha !== captchaValue.toLowerCase()) {
      res.status(400).json({ success: false, message: 'Desafio de seguranca (Captcha) incorreto.' });
      return;
    }
    // Consumir o captcha
    await redis.del(`crm_captcha:${captchaId}`);

    // 4. Buscar Admin e Validar Senha
    const admin = await CRMAdmin.findOne({ where: { email } });
    const isMatch = admin ? await bcrypt.compare(password, admin.senha_hash) : false;

    if (!admin || !isMatch) {
      // Incrementar tentativas
      const attempts = await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, 3600);

      if (attempts >= 5) {
        const penaltyMultiplier = Math.pow(2, attempts - 5);
        const blockTime = Math.min(60 * penaltyMultiplier, 86400); 
        await redis.set(lockoutKey, 'true', 'EX', blockTime);
        res.status(403).json({ 
          success: false, 
          message: `Seguranca Cerasus: 5+ falhas detectadas. Bloqueio ativo.`,
          isBlocked: true
        });
        return;
      }

      res.status(401).json({ 
        success: false, 
        message: `Credenciais invalidas. Tentativa ${attempts} de 5 antes do bloqueio.`
      });
      return;
    }

    // 6. Login Sucesso - Resetar tentativas
    await redis.del(attemptsKey);
    await redis.del(lockoutKey);

    const defaultSecret = 'super_secret_finansys_key_change_me';
    const secret = process.env.CRM_JWT_SECRET || process.env.JWT_SECRET || defaultSecret;

    const token = jwt.sign(
      { id: admin.id, nivel_acesso: admin.nivel_acesso },
      secret,
      { expiresIn: '12h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        nivel_acesso: admin.nivel_acesso
      }
    });

  } catch (error) {
    console.error('Erro no login do admin:', error);
    res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
};

export const getAdmins = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.admin?.nivel_acesso !== 'Admin') {
      res.status(403).json({ message: 'Acesso negado.' });
      return;
    }

    const admins = await CRMAdmin.findAll({ attributes: ['id', 'nome', 'email', 'nivel_acesso', 'createdAt'] });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar administradores.' });
  }
};

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.admin?.nivel_acesso !== 'Admin') {
      res.status(403).json({ message: 'Acesso negado.' });
      return;
    }

    const { nome, email, password, nivel_acesso } = req.body;
    const exists = await CRMAdmin.findOne({ where: { email } });
    if (exists) {
      res.status(400).json({ message: 'E-mail em uso.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const senha_hash = await bcrypt.hash(password, salt);

    const newAdmin = await CRMAdmin.create({ nome, email, senha_hash, nivel_acesso: nivel_acesso || 'Standard' });
    res.status(201).json({ id: newAdmin.id, nome: newAdmin.nome, email: newAdmin.email, nivel_acesso: newAdmin.nivel_acesso });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar administrador.' });
  }
};

export const deleteAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.admin?.nivel_acesso !== 'Admin') {
      res.status(403).json({ message: 'Acesso negado.' });
      return;
    }

    const { id } = req.params;
    if (id === req.admin?.id) {
      res.status(400).json({ message: 'Nao pode deletar a si mesmo.' });
      return;
    }

    await CRMAdmin.destroy({ where: { id } });
    res.json({ success: true, message: 'Removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover administrador.' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, password } = req.body;
    const adminId = req.admin?.id;

    if (!adminId) {
      res.status(401).json({ message: 'Nao autorizado.' });
      return;
    }

    const admin = await CRMAdmin.findByPk(adminId);
    if (!admin) {
      res.status(404).json({ message: 'Nao encontrado.' });
      return;
    }

    if (nome) admin.nome = nome;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.senha_hash = await bcrypt.hash(password, salt);
    }

    await admin.save();
    res.json({ success: true, admin: { id: admin.id, nome: admin.nome, email: admin.email, nivel_acesso: admin.nivel_acesso } });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar dados.' });
  }
};