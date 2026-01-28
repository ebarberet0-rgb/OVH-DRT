import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@yamaha-drt/types';
import { emailService } from '../services/emailService';
import { prisma } from '@yamaha-drt/database';

const router = Router();

// POST /api/emails/send - Envoyer un email personnalisé
router.post('/send', authenticate, authorize(UserRole.ADMIN, UserRole.DEALER), async (req, res, next) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Les champs to, subject et message sont requis',
      });
    }

    const success = await emailService.sendCustomEmail(to, subject, message);

    if (success) {
      res.json({
        success: true,
        message: 'Email envoyé avec succès',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email',
      });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/emails/booking-confirmation/:bookingId - Envoyer confirmation de réservation
router.post('/booking-confirmation/:bookingId', authenticate, authorize(UserRole.ADMIN, UserRole.DEALER), async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    // Récupérer les détails de la réservation
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        event: {
          include: {
            dealer: true,
          },
        },
        session: true,
        motorcycle: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    // Formater les données pour l'email
    const eventDate = new Date(booking.event.startDate).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const sessionTime = new Date(booking.session.startTime).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const success = await emailService.sendBookingConfirmation(
      booking.user.email,
      {
        firstName: booking.user.firstName,
        lastName: booking.user.lastName,
        eventName: booking.event.name,
        eventDate,
        sessionTime,
        motorcycleModel: booking.motorcycle.model,
        dealerName: booking.event.dealer?.name,
        dealerAddress: booking.event.dealer ? `${booking.event.dealer.address}, ${booking.event.dealer.city}` : undefined,
      }
    );

    if (success) {
      res.json({
        success: true,
        message: 'Email de confirmation envoyé',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email',
      });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/emails/booking-reminder/:bookingId - Envoyer un rappel
router.post('/booking-reminder/:bookingId', authenticate, authorize(UserRole.ADMIN, UserRole.DEALER), async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        event: true,
        session: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    const eventDate = new Date(booking.event.startDate).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const sessionTime = new Date(booking.session.startTime).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const success = await emailService.sendBookingReminder(
      booking.user.email,
      {
        firstName: booking.user.firstName,
        eventName: booking.event.name,
        eventDate,
        sessionTime,
      }
    );

    if (success) {
      res.json({
        success: true,
        message: 'Email de rappel envoyé',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email',
      });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/emails/bulk - Envoyer un email à plusieurs destinataires
router.post('/bulk', authenticate, authorize(UserRole.ADMIN), async (req, res, next) => {
  try {
    const { recipients, subject, message } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le champ recipients doit être un tableau non vide',
      });
    }

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Les champs subject et message sont requis',
      });
    }

    // Envoyer à tous les destinataires
    const results = await Promise.allSettled(
      recipients.map(email => emailService.sendCustomEmail(email, subject, message))
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      message: `Emails envoyés: ${successCount} réussis, ${failureCount} échoués`,
      stats: {
        total: results.length,
        success: successCount,
        failure: failureCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/emails/verify - Vérifier la configuration email
router.get('/verify', authenticate, authorize(UserRole.ADMIN), async (_req, res, next) => {
  try {
    const isValid = await emailService.verifyConnection();

    res.json({
      success: isValid,
      message: isValid ? 'Configuration email valide' : 'Configuration email invalide',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
