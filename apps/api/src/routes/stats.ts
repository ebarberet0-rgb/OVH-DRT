import { Router } from 'express';
import { prisma } from '@yamaha-drt/database';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@yamaha-drt/types';

const router = Router();

// GET /api/stats/dashboard - Dashboard statistics
router.get('/dashboard', authenticate, async (_req, res, next) => {
  try {
    // Total potential tests (approximation based on events and sessions)
    const events = await prisma.event.findMany({
      include: {
        sessions: true,
      },
    });

    const totalPotentialTests = events.reduce(
      (sum: number, event: typeof events[number]) => sum + event.sessions.length * event.maxSlotsPerSession,
      0
    );

    // Booking statistics
    const [totalReserved, totalCompleted, totalCancelled, totalNoShow] =
      await Promise.all([
        prisma.booking.count({
          where: { status: { in: ['RESERVED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] } },
        }),
        prisma.booking.count({ where: { status: 'COMPLETED' } }),
        prisma.booking.count({ where: { status: 'CANCELLED' } }),
        prisma.booking.count({ where: { status: 'NO_SHOW' } }),
      ]);

    // Motorcycle statistics
    const motorcycleStats = await prisma.booking.groupBy({
      by: ['motorcycleId'],
      where: { status: { in: ['RESERVED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] } },
      _count: true,
    });

    const motorcyclesWithStats = await Promise.all(
      motorcycleStats.map(async (stat: typeof motorcycleStats[number]) => {
        const moto = await prisma.motorcycle.findUnique({
          where: { id: stat.motorcycleId },
        });
        return {
          model: moto?.model || 'Unknown',
          testsCount: stat._count,
        };
      })
    );

    motorcyclesWithStats.sort((a, b) => b.testsCount - a.testsCount);

    // License statistics
    const bookingsWithLicense = await prisma.booking.findMany({
      where: { status: { in: ['RESERVED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] } },
      select: {
        user: {
          select: { licenseType: true }
        }
      },
    });

    const licenseStats = {
      A: bookingsWithLicense.filter((b: typeof bookingsWithLicense[number]) => b.user.licenseType === 'A').length,
      A2: bookingsWithLicense.filter((b: typeof bookingsWithLicense[number]) => b.user.licenseType === 'A2').length,
      A1: bookingsWithLicense.filter((b: typeof bookingsWithLicense[number]) => b.user.licenseType === 'A1').length,
    };

    // Y-AMT tests count
    const yAmtMotorcycles = await prisma.motorcycle.findMany({
      where: {
        model: {
          contains: 'AMT',
        },
      },
      select: { id: true },
    });

    const yAmtTestsCount = await prisma.booking.count({
      where: {
        motorcycleId: { in: yAmtMotorcycles.map((m: typeof yAmtMotorcycles[number]) => m.id) },
        status: { in: ['RESERVED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
      },
    });

    // Average ratings
    const clientSatisfactionForms = await prisma.clientSatisfactionForm.findMany({
      select: { overallRating: true },
    });

    const averageCustomerRating =
      clientSatisfactionForms.length > 0
        ? clientSatisfactionForms.reduce(
            (sum: number, form: typeof clientSatisfactionForms[number]) => sum + (form.overallRating || 0),
            0
          ) / clientSatisfactionForms.length
        : 0;

    const dealerSatisfactionForms = await prisma.dealerSatisfactionForm.findMany({
      select: { organizationRating: true, teamRating: true },
    });

    const averageDealerRating =
      dealerSatisfactionForms.length > 0
        ? dealerSatisfactionForms.reduce(
            (sum: number, form: typeof dealerSatisfactionForms[number]) => sum + ((form.organizationRating + form.teamRating) / 2),
            0
          ) / dealerSatisfactionForms.length
        : 0;

    // Total sales from dealer satisfaction forms
    const totalSales = await prisma.dealerSatisfactionForm.aggregate({
      _sum: {
        salesCount: true,
      },
    });

    res.json({
      totalPotentialTests,
      totalReserved,
      totalCompleted,
      totalCancelled,
      totalNoShow,
      motorcycleStats: motorcyclesWithStats,
      licenseStats,
      yAmtTestsCount,
      averageCustomerRating,
      averageDealerRating,
      totalSales: totalSales._sum.salesCount || 0,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/stats/website - Website analytics (placeholder)
router.get('/website', authenticate, authorize(UserRole.ADMIN), async (_req, res) => {
  // In production, this would integrate with Google Analytics API
  res.json({
    totalVisitors: 15420,
    uniqueVisitors: 12350,
    averageSessionDuration: 245, // seconds
    bounceRate: 32.5, // percentage
    deviceTypes: {
      mobile: 8500,
      desktop: 5800,
      tablet: 1120,
    },
    sources: {
      search: 6200,
      direct: 3500,
      social: 2800,
      dealer_sites: 1850,
      qr_codes: 1070,
    },
  });
});

// GET /api/stats/emailing - Email/SMS statistics (placeholder)
router.get('/emailing', authenticate, authorize(UserRole.ADMIN), async (_req, res) => {
  res.json({
    totalEmailsSent: 8420,
    totalSmsSent: 3250,
    emailStats: {
      delivered: 8315,
      opened: 6420,
      clicked: 3890,
      bounced: 105,
    },
    smsStats: {
      delivered: 3210,
      failed: 40,
    },
    templates: [
      {
        id: '1',
        name: 'Confirmation de réservation',
        sent: 2450,
        opened: 2200,
        clicked: 1850,
      },
      {
        id: '2',
        name: 'Rappel J-7',
        sent: 2100,
        opened: 1950,
        clicked: 1200,
      },
      {
        id: '3',
        name: 'Formulaire de satisfaction',
        sent: 1800,
        opened: 1420,
        clicked: 840,
      },
    ],
  });
});

export default router;
