import { Router } from 'express';
import { prisma } from '@yamaha-drt/database';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@yamaha-drt/types';
// z module removed - was unused
import bcrypt from 'bcrypt';

const router = Router();

// GET /api/users/debug - Debug endpoint
router.get('/debug', authenticate, authorize(UserRole.ADMIN), async (_req, res, next) => {
  try {
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const clientUsers = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    res.json({
      allUsers,
      clientUsers,
      counts: {
        all: allUsers.length,
        clients: clientUsers.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users - Get all users (Admin only) or Search clients (Authenticated)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userRole = req.user?.role;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role as string;
    const roles = req.query.roles as string;
    const search = req.query.search as string;

    // Security: Only ADMIN can list all users freely.
    // Others (DEALER/INSTRUCTOR) can only search for CLIENTS.
    if (userRole !== UserRole.ADMIN && !search && !role) {
      // Si pas admin et pas de recherche spécifique, on restreint ou on refuse
      // Pour l'instant, on laisse les DEALERs chercher des CLIENTs
    }

    const where: any = {};

    // Force role=CLIENT if not Admin, unless searching specifically
    if (userRole !== UserRole.ADMIN) {
      // TODO: Refine this permission logic if needed
    }

    if (role) {
      where.role = role;
    } else if (roles) {
      // Support multiple roles separated by comma
      const roleArray = roles.split(',').map(r => r.trim());

      // Si un seul rôle, utiliser l'égalité directe au lieu de 'in'
      if (roleArray.length === 1) {
        where.role = roleArray[0];
      } else {
        where.role = { in: roleArray };
      }
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          postalCode: true,
          city: true,
          licenseType: true,
          createdAt: true,
          _count: {
            select: { bookings: true }
          }
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create new user (Admin only)
router.post('/', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
  try {
    const data = req.body;

    // Supprimer les champs qui n'existent pas dans le modèle User
    if (data.dealerId !== undefined) {
      delete data.dealerId;
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Cet email existe déjà' });
    }

    // Hasher le mot de passe
    let hashedPassword;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    } else {
      // Générer un mot de passe par défaut si non fourni
      hashedPassword = await bcrypt.hash('Yamaha2026!', 10);
    }

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || 'CLIENT',
        postalCode: data.postalCode,
        city: data.city,
        licenseType: data.licenseType,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        postalCode: true,
        city: true,
        licenseType: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id - Update user (Admin only)
router.put('/:id', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Empêcher la modification du mot de passe directement ici si nécessaire
    // ou ajouter une logique spécifique pour le hachage
    if (data.password) {
      delete data.password; // Sécurité: passer par une route dédiée ou hasher ici
    }

    // Supprimer les champs qui n'existent pas dans le modèle User
    if (data.dealerId !== undefined) {
      delete data.dealerId;
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        postalCode: true,
        city: true,
        licenseType: true,
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id - Delete user (Admin only)
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    next(error);
  }
});

export default router;
