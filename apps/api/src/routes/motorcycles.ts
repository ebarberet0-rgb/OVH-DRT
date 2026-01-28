import { Router } from 'express';
import { prisma } from '@yamaha-drt/database';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@yamaha-drt/types';

const router = Router();

// GET /api/motorcycles - Get all motorcycles
router.get('/', async (_req, res, next) => {
    try {
        const motorcycles = await prisma.motorcycle.findMany({
            orderBy: { model: 'asc' },
        });
        res.json(motorcycles);
    } catch (error) {
        next(error);
    }
});

// GET /api/motorcycles/available - Get available motorcycles for an event
router.get('/available', async (req, res, next) => {
    try {
        const { eventId } = req.query;
        if (!eventId) {
            return res.status(400).json({ message: 'eventId required' });
        }

        const availableMotorcycles = await prisma.motorcycle.findMany({
            where: {
                status: 'AVAILABLE',
                availabilities: {
                    some: {
                        eventId: eventId as string,
                        isAvailable: true
                    }
                }
            }
        });
        res.json(availableMotorcycles);
    } catch (error) {
        next(error);
    }
});

// POST /api/motorcycles - Create motorcycle (Admin)
router.post('/', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
    try {
        const data = req.body;
        const motorcycle = await prisma.motorcycle.create({
            data,
        });
        res.status(201).json(motorcycle);
    } catch (error) {
        next(error);
    }
});

// PUT /api/motorcycles/:id - Update motorcycle
router.put('/:id', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const motorcycle = await prisma.motorcycle.update({
            where: { id },
            data,
        });
        res.json(motorcycle);
    } catch (error) {
        next(error);
    }
});

// POST /api/motorcycles/:id/damage - Report damage
router.post('/:id/damage', authenticate, authorize(UserRole.ADMIN, UserRole.DEALER, UserRole.INSTRUCTOR), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const userId = req.user!.userId;

        const [damage, motorcycle] = await prisma.$transaction([
            prisma.motorcycleDamage.create({
                data: {
                    motorcycleId: id,
                    description,
                    reportedBy: userId,
                }
            }),
            prisma.motorcycle.update({
                where: { id },
                data: { status: 'DAMAGED' }
            })
        ]);

        res.json({ damage, motorcycle });
    } catch (error) {
        next(error);
    }
});

export default router;
