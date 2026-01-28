import { Router } from 'express';
import { prisma } from '@yamaha-drt/database';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@yamaha-drt/types';
import { logger } from '../utils/logger';

const router = Router();

// Public access enabled for map
// GET /api/dealers
router.get('/', async (_req, res, next) => {
    try {
        const dealers = await prisma.dealer.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(dealers);
    } catch (error) {
        next(error);
    }
});

// GET /api/dealers/:id
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const dealer = await prisma.dealer.findUnique({
            where: { id },
        });
        if (!dealer) {
            return res.status(404).json({ message: 'Concessionnaire non trouvé' });
        }
        res.json(dealer);
    } catch (error) {
        next(error);

    }
});

// POST /api/dealers (Admin only)
router.post('/', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
    try {
        const data = req.body;
        logger.debug('Creating dealer with data:', data);

        // Ensure lat/lng are floats if present
        const createData = {
            ...data,
            latitude: data.latitude ? parseFloat(data.latitude) : null,
            longitude: data.longitude ? parseFloat(data.longitude) : null,
        };

        const dealer = await prisma.dealer.create({
            data: createData,
        });
        logger.info('Dealer created:', dealer.id);
        res.status(201).json(dealer);
    } catch (error) {
        next(error);
    }
});

// PUT /api/dealers/:id (Admin only)
router.put('/:id', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        logger.debug('Updating dealer', id, 'with:', data);

        const updateData = {
            ...data,
            latitude: data.latitude !== undefined ? (data.latitude ? parseFloat(data.latitude) : null) : undefined,
            longitude: data.longitude !== undefined ? (data.longitude ? parseFloat(data.longitude) : null) : undefined,
        };

        const dealer = await prisma.dealer.update({
            where: { id },
            data: updateData,
        });
        res.json(dealer);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/dealers/:id (Admin only)
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.dealer.delete({
            where: { id },
        });
        res.json({ message: 'Concessionnaire supprimé' });
    } catch (error) {
        next(error);
    }
});

export default router;
