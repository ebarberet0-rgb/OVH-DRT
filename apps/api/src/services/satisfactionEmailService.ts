import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@yamaha-drt.fr';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Générer un token JWT pour le formulaire de satisfaction
 */
export function generateSatisfactionToken(bookingId: string, userId: string): string {
  return jwt.sign(
    { bookingId, userId },
    JWT_SECRET,
    { expiresIn: '30d' } // Le lien est valide pendant 30 jours
  );
}

/**
 * Envoyer un email avec le lien du formulaire de satisfaction
 */
export async function sendSatisfactionFormLink(
  userEmail: string,
  userName: string,
  bookingId: string,
  userId: string,
  eventName: string,
  motorcycleModel: string,
  dealerName: string
) {
  try {
    // Générer le token
    const token = generateSatisfactionToken(bookingId, userId);

    // Créer le lien du formulaire
    const formLink = `${FRONTEND_URL}/satisfaction?token=${token}`;

    // Envoyer l'email
    await transporter.sendMail({
      from: `"Yamaha Demo Ride Tour" <${EMAIL_FROM}>`,
      to: userEmail,
      subject: `${userName}, votre avis sur le Yamaha Demo Ride Tour`,
      html: generateEmailHTML(userName, formLink, eventName, motorcycleModel, dealerName),
    });

    console.log(`Email de satisfaction envoyé à ${userEmail} pour la réservation ${bookingId}`);
    return { success: true, token };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de satisfaction:', error);
    throw error;
  }
}

/**
 * Template HTML de l'email
 */
function generateEmailHTML(
  userName: string,
  formLink: string,
  eventName: string,
  motorcycleModel: string,
  dealerName: string
): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre avis compte !</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color: #0D1B54; padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                Yamaha Demo Ride Tour
              </h1>
              <p style="color: #DA291C; margin: 10px 0 0 0; font-size: 16px; font-weight: bold;">
                Votre avis compte ! 🏍️
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #0D1B54; margin: 0 0 20px 0; font-size: 24px;">
                Bonjour ${userName},
              </h2>

              <p style="color: #333333; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Nous espérons que vous avez passé un excellent moment lors de votre essai
                de la <strong>${motorcycleModel}</strong> à l'événement
                <strong>${eventName}</strong> chez <strong>${dealerName}</strong> !
              </p>

              <p style="color: #333333; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Votre avis est <strong>précieux</strong> pour nous aider à améliorer continuellement
                nos événements et offrir la meilleure expérience possible.
              </p>

              <p style="color: #333333; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                Pourriez-vous prendre <strong>quelques minutes</strong> pour répondre à notre
                questionnaire de satisfaction ?
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${formLink}"
                       style="display: inline-block; background-color: #DA291C; color: #ffffff;
                              text-decoration: none; padding: 16px 40px; border-radius: 8px;
                              font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(218, 41, 28, 0.3);">
                      Donner mon avis
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #666666; line-height: 1.5; margin: 30px 0 0 0; font-size: 14px;
                        background-color: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #0D1B54;">
                💡 <strong>Important :</strong> Ce lien est personnel et ne peut être utilisé qu'une seule fois.
                Il reste valide pendant 30 jours.
              </p>

              <!-- Récap de l'essai -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 30px;
                                                background-color: #f9f9f9; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #0D1B54; margin: 0 0 15px 0; font-size: 18px;">
                      📋 Récapitulatif de votre essai
                    </h3>
                    <p style="color: #333; margin: 5px 0; font-size: 14px;">
                      <strong>Événement :</strong> ${eventName}
                    </p>
                    <p style="color: #333; margin: 5px 0; font-size: 14px;">
                      <strong>Moto :</strong> ${motorcycleModel}
                    </p>
                    <p style="color: #333; margin: 5px 0; font-size: 14px;">
                      <strong>Concession :</strong> ${dealerName}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0D1B54; padding: 30px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">
                Merci de votre confiance !
              </p>
              <p style="color: #cccccc; margin: 0 0 20px 0; font-size: 14px; line-height: 1.5;">
                Envie de tester d'autres modèles ? Retrouvez tous nos événements sur notre site
              </p>

              <!-- Social Links -->
              <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="https://www.facebook.com/YamahaMotorFrance"
                       style="color: #ffffff; text-decoration: none; font-size: 24px;">
                      f
                    </a>
                  </td>
                  <td style="padding: 0 10px;">
                    <a href="https://www.instagram.com/yamaha_motor_france"
                       style="color: #ffffff; text-decoration: none; font-size: 24px;">
                      📷
                    </a>
                  </td>
                  <td style="padding: 0 10px;">
                    <a href="https://www.youtube.com/yamaha"
                       style="color: #ffffff; text-decoration: none; font-size: 24px;">
                      ▶
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #888888; margin: 20px 0 0 0; font-size: 12px;">
                © 2026 Yamaha Motor France - Tous droits réservés
              </p>
              <p style="color: #888888; margin: 5px 0 0 0; font-size: 11px;">
                Cet email a été envoyé car vous avez participé à un essai Yamaha Demo Ride Tour
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Email de rappel pour les concessionnaires
 */
export async function sendDealerFormReminder(
  dealerEmail: string,
  dealerName: string,
  eventName: string,
  eventId: string
) {
  try {
    // Générer le token pour le dealer
    const token = jwt.sign({ eventId, dealerEmail }, JWT_SECRET, { expiresIn: '60d' });
    const formLink = `${FRONTEND_URL}/dealer/satisfaction?token=${token}`;

    await transporter.sendMail({
      from: `"Yamaha Demo Ride Tour" <${EMAIL_FROM}>`,
      to: dealerEmail,
      subject: `Rappel : Formulaire de satisfaction - ${eventName}`,
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #0D1B54; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Yamaha Demo Ride Tour</h1>
  </div>

  <div style="padding: 30px; background-color: #f9f9f9;">
    <h2 style="color: #0D1B54;">Bonjour ${dealerName},</h2>

    <p>Nous vous remercions d'avoir participé au Demo Ride Tour <strong>${eventName}</strong>.</p>

    <p>Afin de nous aider à améliorer nos événements, merci de compléter le formulaire de satisfaction en cliquant sur le lien ci-dessous :</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${formLink}"
         style="background-color: #DA291C; color: white; padding: 15px 30px;
                text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Compléter le formulaire
      </a>
    </div>

    <p style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
      <strong>Accès aux leads :</strong> Une fois le formulaire complété, vous pourrez accéder
      et télécharger la liste récapitulative des leads de votre événement.
    </p>
  </div>

  <div style="background-color: #0D1B54; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
    <p style="color: white; margin: 0; font-size: 12px;">
      © 2026 Yamaha Motor France - Tous droits réservés
    </p>
  </div>
</body>
</html>
      `,
    });

    console.log(`Email de rappel envoyé à ${dealerEmail} pour l'événement ${eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de rappel:', error);
    throw error;
  }
}
