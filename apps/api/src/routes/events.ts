import { Router } from 'express';
import { prisma } from '@yamaha-drt/database';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { UserRole } from '@yamaha-drt/types';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/events - Get all events (filtered by role if authenticated)
router.get('/', optionalAuthenticate, async (req, res, next) => {
  try {
    const user = req.user;
    let whereClause: any = {};

    // Si l'utilisateur est INSTRUCTOR, ne montrer que ses événements assignés
    if (user && user.role === UserRole.INSTRUCTOR) {
      whereClause = {
        eventInstructors: {
          some: {
            instructorId: user.userId,
          },
        },
      };
    }
    // ADMIN et DEALER voient tous les événements
    // Les utilisateurs non authentifiés (frontend public) voient aussi tous les événements

    const eventsRaw = await prisma.event.findMany({
      where: whereClause,
      include: {
        dealer: {
          select: {
            name: true,
            city: true,
          },
        },
        bookings: {
          select: {
            status: true,
          },
        },
        motorcycleAvailabilities: {
          include: {
            motorcycle: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    const events = eventsRaw.map((event: typeof eventsRaw[number]) => ({
      ...event,
      motorcycles: event.motorcycleAvailabilities.map((ma: typeof event.motorcycleAvailabilities[number]) => ma.motorcycle),
    }));

    res.json(events);
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:id - Get event by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventRaw = await prisma.event.findUnique({
      where: { id },
      include: {
        dealer: true,
        sessions: {
          orderBy: {
            startTime: 'asc',
          },
        },
        motorcycleAvailabilities: {
          include: {
            motorcycle: true,
          },
        },
      },
    });
    if (!eventRaw) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    const event = {
      ...eventRaw,
      motorcycles: eventRaw.motorcycleAvailabilities.map((ma: typeof eventRaw.motorcycleAvailabilities[number]) => ({
        id: ma.motorcycle.id,
        model: ma.motorcycle.model,
        number: ma.motorcycle.bikeNumber,
        group: ma.motorcycle.group === 'GROUP_1' ? 1 : 2,
        imageUrl: ma.motorcycle.imageUrl,
        status: ma.isAvailable && ma.motorcycle.status === 'AVAILABLE' ? 'AVAILABLE' : 'UNAVAILABLE',
      })),
    };

    res.json(event);
  } catch (error) {
    next(error);
  }
});

// POST /api/events - Create new event (Admin only)
router.post('/', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
  try {
    const { name, type, dealerId, startDate, endDate, address, city, postalCode, latitude, longitude, maxSlotsPerSession, sessions } = req.body;

    logger.debug('Creating Event - Payload received:', JSON.stringify(req.body, null, 2));

    // Robust parsing for potentially stringified numbers
    // Handle both comma and dot decimal separators (French vs English format)
    const parseCoordinate = (value: any): number | null => {
      if (value === undefined || value === null || value === '') return null;
      // Convert to string and replace comma with dot for French format
      const normalized = String(value).replace(',', '.');
      const parsed = parseFloat(normalized);
      return !isNaN(parsed) ? parsed : null;
    };

    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);
    const slots = maxSlotsPerSession ? parseInt(String(maxSlotsPerSession), 10) : 7;

    const createData: any = {
      name,
      type,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      address,
      city,
      postalCode,
      latitude: lat !== null && !isNaN(lat) ? lat : null,
      longitude: lng !== null && !isNaN(lng) ? lng : null,
      maxSlotsPerSession: slots,
      sessions: {
        create: Array.isArray(sessions) ? sessions.map((session: any) => ({
          startTime: new Date(session.startTime).toISOString(),
          endTime: new Date(session.endTime).toISOString(),
          availableSlots: parseInt(String(session.availableSlots), 10),
          bookedSlots: session.bookedSlots ? parseInt(String(session.bookedSlots), 10) : 0,
          group: session.group
        })) : []
      }
    };

    // Only add dealerId if it's present and valid
    if (dealerId && typeof dealerId === 'string' && dealerId.trim() !== '') {
      createData.dealerId = dealerId;
    }

    logger.debug('Final Create Data:', JSON.stringify(createData, null, 2));

    const event = await prisma.event.create({
      data: createData,
      include: {
        dealer: true,
        sessions: true,
      },
    });
    res.status(201).json(event);
  } catch (error) {
    logger.error('ERROR CREATING EVENT:', error);
    next(error);
  }
});

// PUT /api/events/:id - Update event (Admin only)
router.put('/:id', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, dealerId, startDate, endDate, address, city, postalCode, latitude, longitude, maxSlotsPerSession } = req.body;

    logger.debug('Updating Event - ID:', id);
    logger.debug('Payload received:', JSON.stringify(req.body, null, 2));

    // Robust parsing for potentially stringified numbers
    // Handle both comma and dot decimal separators (French vs English format)
    const parseCoordinate = (value: any): number | null => {
      if (value === undefined || value === null || value === '') return null;
      // Convert to string and replace comma with dot for French format
      const normalized = String(value).replace(',', '.');
      const parsed = parseFloat(normalized);
      return !isNaN(parsed) ? parsed : null;
    };

    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);
    const slots = maxSlotsPerSession ? parseInt(String(maxSlotsPerSession), 10) : undefined;

    const updateData: any = {};

    // Only include fields that are provided
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (startDate !== undefined) updateData.startDate = new Date(startDate).toISOString();
    if (endDate !== undefined) updateData.endDate = new Date(endDate).toISOString();
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (postalCode !== undefined) updateData.postalCode = postalCode;

    // Update coordinates - allow setting to null or to a valid number
    if (latitude !== undefined) {
      updateData.latitude = lat;
    }
    if (longitude !== undefined) {
      updateData.longitude = lng;
    }
    if (slots !== undefined) updateData.maxSlotsPerSession = slots;

    // Handle dealerId - can be set, changed, or removed
    if (dealerId !== undefined) {
      if (dealerId && typeof dealerId === 'string' && dealerId.trim() !== '') {
        updateData.dealerId = dealerId;
      } else {
        updateData.dealerId = null;
      }
    }

    logger.debug('Final Update Data:', JSON.stringify(updateData, null, 2));

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        dealer: true,
        sessions: true,
      },
    });
    res.json(event);
  } catch (error) {
    logger.error('ERROR UPDATING EVENT:', error);
    next(error);
  }
});

// GET /api/events/:id/stats - Get event statistics
router.get('/:id/stats', authenticate, authorize(UserRole.ADMIN, UserRole.DEALER), async (req, res, next) => {
  try {
    const { id } = req.params;

    const [event, bookingsCount, satisfactionStats] = await prisma.$transaction([
      prisma.event.findUnique({
        where: { id },
        include: { sessions: true }
      }),
      prisma.booking.count({
        where: {
          eventId: id,
          status: { not: 'CANCELLED' }
        }
      }),
      prisma.clientSatisfactionForm.aggregate({
        where: { eventId: id },
        _avg: {
          overallRating: true,
          motorcycleRating: true,
          instructorRating: true,
          organizationRating: true
        },
        _count: true
      })
    ]);

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    const totalSlots = event.sessions.reduce((acc: number, session: typeof event.sessions[number]) => acc + session.availableSlots, 0);
    const occupancyRate = totalSlots > 0 ? (bookingsCount / totalSlots) * 100 : 0;

    res.json({
      totalSlots,
      bookingsCount,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      satisfaction: {
        count: satisfactionStats._count,
        ratings: satisfactionStats._avg
      }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/events/:id - Delete event (Admin only)
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info('DELETING EVENT:', id);
    await prisma.event.delete({
      where: { id },
    });
    res.json({ message: 'Événement supprimé' });
  } catch (error) {
    next(error);
  }
});

// POST /api/events/:id/instructors - Assign instructor to event (Admin only)
router.post('/:id/instructors', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { instructorId } = req.body;

    // Vérifier que l'utilisateur existe et est bien un instructeur
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
    });

    if (!instructor || instructor.role !== UserRole.INSTRUCTOR) {
      return res.status(400).json({ message: 'Utilisateur invalide ou n\'est pas un instructeur' });
    }

    // Créer l'assignation
    const assignment = await prisma.eventInstructor.create({
      data: {
        eventId: id,
        instructorId: instructorId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(assignment);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Cet instructeur est déjà assigné à cet événement' });
    }
    next(error);
  }
});

// DELETE /api/events/:id/instructors/:instructorId - Remove instructor from event (Admin only)
router.delete('/:id/instructors/:instructorId', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
  try {
    const { id, instructorId } = req.params;

    await prisma.eventInstructor.deleteMany({
      where: {
        eventId: id,
        instructorId: instructorId,
      },
    });

    res.json({ message: 'Instructeur retiré de l\'événement' });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:id/instructors - Get instructors assigned to event
router.get('/:id/instructors', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const instructors = await prisma.eventInstructor.findMany({
      where: { eventId: id },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.json(instructors);
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:id/bookings - Get bookings for an event (filtered by date)
router.get('/:id/bookings', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const where: any = {
      eventId: id,
    };

    // Si une date est fournie, filtrer par la date de la session
    if (date && typeof date === 'string') {
      const searchDate = new Date(date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);

      where.session = {
        startTime: {
          gte: searchDate.toISOString(),
          lt: nextDate.toISOString(),
        },
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            licenseType: true,
          },
        },
        motorcycle: true,
        session: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

// POST /api/events/:id/motorcycles - Sync event fleet (Admin only)
router.post('/:id/motorcycles', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motorcycleIds } = req.body;

    if (!Array.isArray(motorcycleIds)) {
      return res.status(400).json({ message: 'motorcycleIds must be an array' });
    }

    // Transaction to replace all availabilities
    await prisma.$transaction(async (tx: any) => {
      // 1. Delete all existing availabilities for this event
      await tx.motorcycleAvailability.deleteMany({
        where: { eventId: id },
      });

      // 2. Create new availabilities
      if (motorcycleIds.length > 0) {
        await tx.motorcycleAvailability.createMany({
          data: motorcycleIds.map((motorcycleId: string) => ({
            eventId: id,
            motorcycleId,
            isAvailable: true, // Default to true
          })),
          skipDuplicates: true, // In case duplicate IDs sent
        });
      }
    });

    res.json({ message: 'Flotte mise à jour avec succès' });
  } catch (error) {
    next(error);
  }
});

export default router;
