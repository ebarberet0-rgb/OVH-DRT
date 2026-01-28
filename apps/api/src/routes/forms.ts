import { Router } from 'express';
import { prisma } from '@yamaha-drt/database';
import { authenticate } from '../middleware/auth';
import jwt from 'jsonwebtoken';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================
// CLIENT SATISFACTION FORMS - Public routes
// ============================================

// GET /api/forms/client-satisfaction/verify - Vérifier le token (public, pas d'auth)
router.get('/client-satisfaction/verify', async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token manquant' });
    }

    // Vérifier le token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    const { bookingId } = decoded;

    // Vérifier si le formulaire n'a pas déjà été soumis
    const existingForm = await prisma.clientSatisfactionForm.findUnique({
      where: { bookingId },
    });

    if (existingForm) {
      return res.status(400).json({ error: 'Ce formulaire a déjà été complété' });
    }

    // Récupérer les informations de la réservation
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
        motorcycle: {
          select: {
            id: true,
            model: true,
            category: true,
          },
        },
        dealer: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    // Vérifier que la réservation est complétée
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'L\'essai n\'est pas encore terminé' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// POST /api/forms/client-satisfaction/submit - Soumettre le formulaire (public, pas d'auth)
router.post('/client-satisfaction/submit', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token manquant' });
    }

    // Vérifier le token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    const { bookingId } = decoded;

    const {
      overallRating,
      motorcycleRating,
      instructorRating,
      organizationRating,
      purchaseIntent,
      purchaseTimeframe,
      comments,
    } = req.body;

    // Validation des données
    if (!overallRating || !motorcycleRating || !instructorRating || !organizationRating || !purchaseIntent) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }

    // Vérifier que la réservation existe
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    // Vérifier que le formulaire n'a pas déjà été soumis
    const existingForm = await prisma.clientSatisfactionForm.findUnique({
      where: { bookingId },
    });

    if (existingForm) {
      return res.status(400).json({ error: 'Ce formulaire a déjà été soumis' });
    }

    // Créer le formulaire de satisfaction
    const satisfactionForm = await prisma.clientSatisfactionForm.create({
      data: {
        bookingId,
        userId: booking.userId,
        eventId: booking.eventId,
        overallRating: parseInt(overallRating),
        motorcycleRating: parseInt(motorcycleRating),
        instructorRating: parseInt(instructorRating),
        organizationRating: parseInt(organizationRating),
        purchaseIntent,
        purchaseTimeframe: purchaseTimeframe || null,
        comments: comments || null,
      },
    });

    res.json({
      message: 'Formulaire soumis avec succès',
      data: satisfactionForm,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/forms/client-satisfaction - Liste tous les formulaires (backoffice, avec auth)
router.get('/client-satisfaction', authenticate, async (req, res, next) => {
  try {
    const { search } = req.query;

    const forms = await prisma.clientSatisfactionForm.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        event: {
          include: {
            dealer: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
        },
        booking: {
          include: {
            motorcycle: {
              select: {
                id: true,
                model: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filtrage côté serveur si nécessaire
    let filteredForms = forms;

    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filteredForms = filteredForms.filter(
        (form: typeof forms[number]) =>
          form.user.firstName.toLowerCase().includes(searchLower) ||
          form.user.lastName.toLowerCase().includes(searchLower) ||
          form.user.email.toLowerCase().includes(searchLower) ||
          form.event.name.toLowerCase().includes(searchLower)
      );
    }

    res.json(filteredForms);
  } catch (error) {
    next(error);
  }
});

// ============================================
// CLIENT SATISFACTION FORMS - Protected routes (existing)
// ============================================

// GET /api/forms/client-satisfaction/:bookingId
router.get('/client-satisfaction/:bookingId', authenticate, async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const form = await prisma.clientSatisfactionForm.findUnique({
      where: { bookingId },
    });

    res.json(form);
  } catch (error) {
    next(error);
  }
});

// POST /api/forms/client-satisfaction/:bookingId
router.post('/client-satisfaction/:bookingId', async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const data = req.body;

    // Vérifier que la réservation existe et est complétée
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        message: 'Le formulaire ne peut être rempli que pour des essais effectués',
      });
    }

    // Créer ou mettre à jour le formulaire
    const form = await prisma.clientSatisfactionForm.upsert({
      where: { bookingId },
      create: {
        bookingId,
        ...data,
      },
      update: data,
    });

    res.json(form);
  } catch (error) {
    next(error);
  }
});

// ============================================
// DEALER SATISFACTION FORMS
// ============================================

// GET /api/forms/dealer-satisfaction - Liste tous les formulaires dealers
router.get('/dealer-satisfaction', authenticate, async (_req, res, next) => {
  try {
    const forms = await prisma.dealerSatisfactionForm.findMany({
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
        dealer: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Ajouter le statut "completed" et "overdue"
    const formsWithStatus = forms.map((form: typeof forms[number]) => {
      const isOverdue = new Date(form.event.endDate) < new Date() && !form.salesCount;
      return {
        ...form,
        completed: !!form.salesCount,
        overdue: isOverdue,
      };
    });

    res.json(formsWithStatus);
  } catch (error) {
    next(error);
  }
});

// GET /api/forms/dealer-satisfaction/:eventId
router.get('/dealer-satisfaction/:eventId', authenticate, async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const form = await prisma.dealerSatisfactionForm.findUnique({
      where: { eventId },
    });

    res.json(form);
  } catch (error) {
    next(error);
  }
});

// POST /api/forms/dealer-satisfaction/:eventId
router.post('/dealer-satisfaction/:eventId', authenticate, async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const data = req.body;

    const form = await prisma.dealerSatisfactionForm.upsert({
      where: { eventId },
      create: {
        eventId,
        ...data,
      },
      update: data,
    });

    res.json(form);
  } catch (error) {
    next(error);
  }
});

// POST /api/forms/dealer-satisfaction/:eventId/reminder - Envoyer un rappel
router.post('/dealer-satisfaction/:eventId/reminder', authenticate, async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        dealer: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Événement introuvable' });
    }

    // TODO: Implémenter l'envoi d'email
    // await sendDealerFormReminder(event.dealer.email, event);

    res.json({ message: 'Email de rappel envoyé' });
  } catch (error) {
    next(error);
  }
});

// ============================================
// DRT TEAM REPORTS
// ============================================

// GET /api/forms/team-report - Liste tous les rapports DRT
router.get('/team-report', authenticate, async (_req, res, next) => {
  try {
    const reports = await prisma.dRTTeamReport.findMany({
      include: {
        event: {
          include: {
            dealer: true,
          },
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Ajouter le statut
    const reportsWithStatus = reports.map((report: typeof reports[number]) => {
      const isOverdue = new Date(report.event.endDate) < new Date() && !report.totalScore;
      return {
        ...report,
        completed: !!report.totalScore,
        overdue: isOverdue,
      };
    });

    res.json(reportsWithStatus);
  } catch (error) {
    next(error);
  }
});

// GET /api/forms/team-report/yearly-ranking - Rapport annuel avec classement
router.get('/team-report/yearly-ranking', authenticate, async (_req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();

    const reports = await prisma.dRTTeamReport.findMany({
      where: {
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        },
      },
      include: {
        event: {
          include: {
            dealer: true,
          },
        },
      },
    });

    // Grouper par dealer et calculer les moyennes
    const dealerStats: { [key: string]: any } = {};

    reports.forEach((report: typeof reports[number]) => {
      const dealerId = report.event.dealer.id;
      if (!dealerStats[dealerId]) {
        dealerStats[dealerId] = {
          dealerId,
          dealerName: report.event.dealer.name,
          city: report.event.dealer.city,
          eventCount: 0,
          totalScore: 0,
          leadScore: 0,
          animationScore: 0,
          engagementScore: 0,
          communicationScore: 0,
          satisfactionScore: 0,
        };
      }

      dealerStats[dealerId].eventCount++;
      dealerStats[dealerId].totalScore += report.totalScore;
      dealerStats[dealerId].leadScore += report.leadTreatmentScore;
      dealerStats[dealerId].animationScore += report.animationScore;
      dealerStats[dealerId].engagementScore += report.teamEngagementScore;
      dealerStats[dealerId].communicationScore += report.communicationScore;
      dealerStats[dealerId].satisfactionScore += report.clientSatisfactionScore;
    });

    // Calculer les moyennes et trier
    const rankings = Object.values(dealerStats)
      .map((stats: any) => ({
        dealerId: stats.dealerId,
        dealerName: stats.dealerName,
        city: stats.city,
        eventCount: stats.eventCount,
        averageScore: stats.totalScore / stats.eventCount,
        avgLeadScore: stats.leadScore / stats.eventCount,
        avgAnimationScore: stats.animationScore / stats.eventCount,
        avgEngagementScore: stats.engagementScore / stats.eventCount,
        avgCommunicationScore: stats.communicationScore / stats.eventCount,
        avgSatisfactionScore: stats.satisfactionScore / stats.eventCount,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    res.json({
      year: currentYear,
      rankings,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/forms/team-report/:eventId
router.get('/team-report/:eventId', authenticate, async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const form = await prisma.dRTTeamReport.findUnique({
      where: { eventId },
    });

    res.json(form);
  } catch (error) {
    next(error);
  }
});

// POST /api/forms/team-report/:eventId
router.post('/team-report/:eventId', authenticate, async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const data = req.body;

    const form = await prisma.teamReportForm.upsert({
      where: { eventId },
      create: {
        eventId,
        ...data,
      },
      update: data,
    });

    res.json(form);
  } catch (error) {
    next(error);
  }
});

export default router;
