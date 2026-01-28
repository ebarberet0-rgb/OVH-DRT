import { Router } from 'express';
import { prisma } from '@yamaha-drt/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/sessions - Get sessions for an event
router.get('/', async (req, res, next) => {
    try {
        const { eventId, group } = req.query;

        if (!eventId) {
            return res.status(400).json({ message: 'eventId required' });
        }

        const where: any = {
            eventId: eventId as string,
        };

        if (group) {
            where.group = group;
        }

        const sessions = await prisma.session.findMany({
            where,
            orderBy: {
                startTime: 'asc',
            },
            include: {
                _count: {
                    select: { bookings: true }
                },
                instructor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        });

        // Map _count.bookings to bookedSlots for consistency
        const sessionsWithBookedSlots = sessions.map((session: typeof sessions[number]) => ({
            ...session,
            bookedSlots: session._count.bookings,
            _count: undefined,
        }));

        res.json(sessionsWithBookedSlots);
    } catch (error) {
        next(error);
    }
});

// POST /api/sessions - Create a new session
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { eventId, startTime, endTime, availableSlots, group, instructorId } = req.body;

        // Validate required fields
        if (!eventId || !startTime || !endTime || !availableSlots || !group) {
            return res.status(400).json({
                message: 'eventId, startTime, endTime, availableSlots, and group are required'
            });
        }

        // Verify the event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Create the session
        const newSession = await prisma.session.create({
            data: {
                eventId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                availableSlots: parseInt(availableSlots),
                group,
                instructorId: instructorId || null,
            },
            include: {
                _count: {
                    select: { bookings: true }
                },
                instructor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        });

        res.status(201).json({
            ...newSession,
            bookedSlots: newSession._count.bookings,
            _count: undefined,
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/sessions/:id - Update a session
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { startTime, endTime, availableSlots, group, instructorId } = req.body;

        // Validate required fields
        if (!startTime || !endTime || !availableSlots || !group) {
            return res.status(400).json({
                message: 'startTime, endTime, availableSlots, and group are required'
            });
        }

        // Check that the session exists
        const existingSession = await prisma.session.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { bookings: true }
                }
            }
        });

        if (!existingSession) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Validate that availableSlots is not less than current bookings
        if (availableSlots < existingSession._count.bookings) {
            return res.status(400).json({
                message: `Cannot reduce available slots below current bookings (${existingSession._count.bookings})`
            });
        }

        // Update the session
        const updatedSession = await prisma.session.update({
            where: { id },
            data: {
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                availableSlots: parseInt(availableSlots),
                group,
                instructorId: instructorId || null,
            },
            include: {
                _count: {
                    select: { bookings: true }
                },
                instructor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        });

        res.json({
            ...updatedSession,
            bookedSlots: updatedSession._count.bookings,
            _count: undefined,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
