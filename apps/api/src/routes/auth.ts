import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '@yamaha-drt/database';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Schema de validation pour le login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Schema de validation pour l'inscription client
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  licenseType: z.enum(['A', 'A2', 'A1']).optional(),
});

/**
 * POST /api/auth/register
 * Inscription d'un nouveau client
 */
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(409, 'Email already exists');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: 'CLIENT',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    );

    res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    logger.info(`Login attempt for: ${email}`);

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      logger.warn(`User not found or no password for: ${email}`);
      throw new AppError(401, 'Invalid credentials');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for: ${email}`);
      throw new AppError(401, 'Invalid credentials');
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        city: true,
        postalCode: true,
        licenseType: true,
        currentBrand: true,
        currentModel: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/auth/profile
 * Mettre à jour le profil de l'utilisateur connecté
 */
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const updateSchema = z.object({
      firstName: z.string().min(2).optional(),
      lastName: z.string().min(2).optional(),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      currentBrand: z.string().optional(),
      currentModel: z.string().optional(),
      licenseType: z.enum(['A', 'A2', 'A1']).optional(),
    });

    const data = updateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        city: true,
        postalCode: true,
        licenseType: true,
        currentBrand: true,
        currentModel: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
