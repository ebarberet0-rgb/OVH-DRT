import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
  }>;
}

class EmailService {
  private transporter: Transporter | null = null;
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true pour port 465, false pour autres ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    // Vérifier que les credentials sont configurés
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('⚠️ Email service not configured. Set SMTP_USER and SMTP_PASS environment variables.');
      this.initialized = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport(emailConfig);
      this.initialized = true;
      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      this.initialized = false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.initialized || !this.transporter) {
      console.error('Email service not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || `Yamaha Demo Ride Tour <${process.env.SMTP_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  // Templates d'emails prédéfinis
  async sendBookingConfirmation(
    to: string,
    data: {
      firstName: string;
      lastName: string;
      eventName: string;
      eventDate: string;
      sessionTime: string;
      motorcycleModel: string;
      dealerName?: string;
      dealerAddress?: string;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a1a1a; color: white; padding: 30px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .info-box { background-color: white; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; background-color: #d32f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Confirmation de réservation</h1>
            <p>Yamaha Demo Ride Tour</p>
          </div>
          <div class="content">
            <p>Bonjour ${data.firstName} ${data.lastName},</p>
            <p>Votre réservation pour le <strong>Yamaha Demo Ride Tour</strong> a bien été confirmée !</p>

            <div class="info-box">
              <h3>Détails de votre réservation :</h3>
              <ul>
                <li><strong>Événement :</strong> ${data.eventName}</li>
                <li><strong>Date :</strong> ${data.eventDate}</li>
                <li><strong>Horaire :</strong> ${data.sessionTime}</li>
                <li><strong>Moto :</strong> ${data.motorcycleModel}</li>
                ${data.dealerName ? `<li><strong>Concession :</strong> ${data.dealerName}</li>` : ''}
                ${data.dealerAddress ? `<li><strong>Adresse :</strong> ${data.dealerAddress}</li>` : ''}
              </ul>
            </div>

            <p><strong>N'oubliez pas d'apporter :</strong></p>
            <ul>
              <li>Votre permis de conduire moto en cours de validité</li>
              <li>Une pièce d'identité</li>
              <li>Votre équipement moto (casque, gants, blouson, bottes)</li>
            </ul>

            <p>Nous avons hâte de vous accueillir pour cette expérience unique !</p>
          </div>
          <div class="footer">
            <p>Yamaha Demo Ride Tour</p>
            <p>Ce message a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `Confirmation de réservation - Yamaha Demo Ride Tour`,
      html,
    });
  }

  async sendBookingReminder(
    to: string,
    data: {
      firstName: string;
      eventName: string;
      eventDate: string;
      sessionTime: string;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a1a1a; color: white; padding: 30px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .reminder-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rappel de réservation</h1>
            <p>Yamaha Demo Ride Tour</p>
          </div>
          <div class="content">
            <p>Bonjour ${data.firstName},</p>

            <div class="reminder-box">
              <h3>⏰ Rappel : Votre essai approche !</h3>
              <ul>
                <li><strong>Événement :</strong> ${data.eventName}</li>
                <li><strong>Date :</strong> ${data.eventDate}</li>
                <li><strong>Horaire :</strong> ${data.sessionTime}</li>
              </ul>
            </div>

            <p>N'oubliez pas d'apporter votre permis de conduire et votre équipement moto complet.</p>
            <p>À très bientôt !</p>
          </div>
          <div class="footer">
            <p>Yamaha Demo Ride Tour</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `Rappel : Votre essai Yamaha est demain !`,
      html,
    });
  }

  async sendCustomEmail(
    to: string | string[],
    subject: string,
    message: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a1a1a; color: white; padding: 30px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Yamaha Demo Ride Tour</h1>
          </div>
          <div class="content">
            ${message}
          </div>
          <div class="footer">
            <p>Yamaha Demo Ride Tour</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject,
      html,
    });
  }

  // Vérifier la connexion SMTP
  async verifyConnection(): Promise<boolean> {
    if (!this.initialized || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      return false;
    }
  }
}

// Export une instance singleton
export const emailService = new EmailService();
