import { Router } from 'express';
import { prisma } from '@yamaha-drt/database';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@yamaha-drt/types';
import bcrypt from 'bcrypt';

const router = Router();

// GET /api/bookings - Get all bookings
router.get('/', authenticate, async (_req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true, // Inclure les informations de l'utilisateur
        motorcycle: true,
        session: true,
        event: {
          include: {
            dealer: true,
          },
        },
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

// GET /api/bookings/:id - Get booking by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        motorcycle: true,
        session: true,
        event: {
          include: {
            dealer: true,
          },
        },
        satisfactionForm: true,
      },
    });
    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/event/:eventId - Get bookings for an event
router.get('/event/:eventId', authenticate, async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const bookings = await prisma.booking.findMany({
      where: { eventId },
      include: {
        user: true,
        motorcycle: true,
        session: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map les données pour inclure les informations client au niveau racine
    const mappedBookings = bookings.map((booking: typeof bookings[number]) => ({
      ...booking,
      clientFirstName: booking.user.firstName,
      clientLastName: booking.user.lastName,
      clientEmail: booking.user.email,
      clientPhone: booking.user.phone,
      clientLicenseType: booking.user.licenseType,
      bookingSource: booking.source,
    }));

    res.json(mappedBookings);
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id - Update booking
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const booking = await prisma.booking.update({
      where: { id },
      data,
      include: {
        motorcycle: true,
        session: true,
      },
    });
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/bookings/:id - Cancel booking
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
    res.json({ message: 'Réservation annulée', booking });
  } catch (error) {
    next(error);
  }
});

// POST /api/bookings - Create new booking
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { eventId, motorcycleId, sessionId } = req.body;
    const userId = req.user!.userId;

    // 1. Vérifier si l'utilisateur a déjà atteint la limite de réservations (par ex 2)
    // Note: Pour cet exemple, je mets une limite simple, à adapter selon les règles métier exactes
    const userBookingsCount = await prisma.booking.count({
      where: {
        userId,
        eventId,
        status: {
          notIn: ['CANCELLED', 'NO_SHOW']
        }
      }
    });

    if (userBookingsCount >= 2) {
      return res.status(400).json({ message: 'Vous avez atteint la limite de 2 essais par événement.' });
    }

    // 2. Vérifier la disponibilité de la session dans une transaction
    const booking = await prisma.$transaction(async (tx: any) => {
      const session = await tx.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new Error('Créneau non trouvé');
      }

      if (session.bookedSlots >= session.availableSlots) {
        throw new Error('Ce créneau est complet');
      }

      // Incrémenter le compteur de slots
      await tx.session.update({
        where: { id: sessionId },
        data: { bookedSlots: { increment: 1 } },
      });

      // Créer la réservation
      return tx.booking.create({
        data: {
          userId,
          eventId,
          sessionId,
          motorcycleId,
          status: 'RESERVED',
          source: 'WEBSITE', // Par défaut pour l'API web
        },
        include: {
          motorcycle: true,
          session: true,
          event: true
        }
      });
    });

    res.status(201).json(booking);
  } catch (error: any) {
    if (error.message === 'Ce créneau est complet' || error.message === 'Créneau non trouvé') {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
});

// POST /api/bookings/walk-in - Create walk-in booking from tablet
router.post('/walk-in', authenticate, async (req, res, next) => {
  try {
    const { eventId, motorcycleId, timeSlot, date, firstName, lastName, email, phone, licenseType } = req.body;

    console.log('Walk-in booking request:', { eventId, motorcycleId, timeSlot, date, firstName, lastName, email });

    // Validate required fields
    if (!eventId || !motorcycleId || !timeSlot || !firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user with default password
      const hashedPassword = await bcrypt.hash('TempPass2024!', 10);
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone: phone || '',
          licenseType: licenseType || 'A',
          role: 'CLIENT',
        },
      });
    }

    // Find motorcycle to get its group
    const motorcycle = await prisma.motorcycle.findUnique({
      where: { id: motorcycleId },
    });

    if (!motorcycle) {
      return res.status(404).json({ message: 'Moto non trouvée' });
    }

    // Parse date and timeSlot to find the matching session
    const searchDate = new Date(date);
    const [hours, minutes] = timeSlot.split(':').map(Number);
    searchDate.setHours(hours, minutes, 0, 0);

    // Find session matching the timeSlot and motorcycle group
    const session = await prisma.session.findFirst({
      where: {
        eventId,
        group: motorcycle.group,
        startTime: {
          gte: searchDate,
          lt: new Date(searchDate.getTime() + 60 * 60 * 1000), // Within 1 hour
        },
      },
    });

    if (!session) {
      return res.status(404).json({ message: 'Aucun créneau trouvé pour cette heure et ce groupe de motos' });
    }

    // Check if session is full
    const currentBookings = await prisma.booking.count({
      where: {
        sessionId: session.id,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    });

    if (currentBookings >= session.availableSlots) {
      return res.status(400).json({ message: 'Ce créneau est complet' });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        eventId,
        sessionId: session.id,
        motorcycleId,
        status: 'CONFIRMED', // Walk-ins are immediately confirmed
        source: 'WALK_IN',
      },
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
        event: true,
      },
    });

    res.status(201).json(booking);
  } catch (error: any) {
    console.error('Walk-in booking error:', error);
    next(error);
  }
});

// POST /api/bookings/:id/confirm - Confirm booking presence (Tablet/Admin)
router.post('/:id/confirm', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
      },
    });
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id/status - Update booking status (Tablet/Admin)
router.put('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Statut requis' });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status,
      },
    });
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// PUT /api/bookings/:id/user - Update user information for a booking
router.put('/:id/user', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      postalCode,
      city,
      currentBrand,
      currentModel,
      licenseType,
      licenseNumber,
      licenseIssueDate,
      licenseExpiryDate
    } = req.body;

    // Vérifier que la réservation existe
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    // Préparer les données de mise à jour (seulement les champs fournis)
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (city !== undefined) updateData.city = city;
    if (currentBrand !== undefined) updateData.currentBrand = currentBrand;
    if (currentModel !== undefined) updateData.currentModel = currentModel;
    if (licenseType !== undefined) updateData.licenseType = licenseType;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (licenseIssueDate !== undefined) updateData.licenseIssueDate = licenseIssueDate ? new Date(licenseIssueDate) : null;
    if (licenseExpiryDate !== undefined) updateData.licenseExpiryDate = licenseExpiryDate ? new Date(licenseExpiryDate) : null;

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: booking.userId },
      data: updateData
    });

    // Retourner la réservation avec les données utilisateur mises à jour
    const updatedBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        motorcycle: true,
        session: true,
        event: {
          include: {
            dealer: true
          }
        }
      }
    });

    res.json(updatedBooking);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre utilisateur' });
    }
    next(error);
  }
});

// GET /api/bookings/export/leads/:eventId - Export leads for Salesforce
router.get('/export/leads/:eventId', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const bookings = await prisma.booking.findMany({
      where: { eventId },
      include: {
        user: true,
        event: {
          include: {
            dealer: true,
          },
        },
      },
    });

    // Format CSV for Salesforce
    const csv = [
      'First Name,Last Name,Email,Phone,License Type,Event,Dealer,Date,Status',
      ...bookings.map((b: typeof bookings[number]) =>
        `${b.user.firstName},${b.user.lastName},${b.user.email},${b.user.phone},${b.user.licenseType || 'N/A'},${b.event.name},${b.event.dealer?.name || 'N/A'},${b.createdAt},${b.status}`
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=leads-${eventId}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// GET /api/bookings/export/satisfaction/:eventId - Export satisfaction data
router.get('/export/satisfaction/:eventId', authenticate, async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const bookings = await prisma.booking.findMany({
      where: {
        eventId,
        status: 'COMPLETED',
      },
      include: {
        user: true,
        satisfactionForm: true,
        motorcycle: true,
      },
    });

    // Format CSV
    const csv = [
      'Client,Email,Motorcycle,Rating,Purchase Intent,Comments',
      ...bookings.map((b: typeof bookings[number]) =>
        `${b.user.firstName} ${b.user.lastName},${b.user.email},${b.motorcycle.model},${b.satisfactionForm?.overallRating || 'N/A'},${b.satisfactionForm?.purchaseIntent || 'N/A'},${b.satisfactionForm?.comments || ''}`
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=satisfaction-${eventId}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

export default router;
