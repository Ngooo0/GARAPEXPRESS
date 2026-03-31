import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  private transporter: nodemailer.Transporter | null;
  private isConfigured: boolean;

  constructor() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️  Email credentials not configured - Email service disabled');
      this.transporter = null;
      this.isConfigured = false;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    this.isConfigured = true;
    console.log('✅ Email service initialized');
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('⚠️  Email service not configured - skipping password reset email');
      return false;
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      const mailOptions = {
        from: `"GarapExpress" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe - GarapExpress',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #4F46E5; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; text-align: center;">GarapExpress</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333;">Réinitialisation de mot de passe</h2>
              <p style="color: #666; line-height: 1.6;">
                Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Réinitialiser mon mot de passe
                </a>
              </div>
              <p style="color: #666; line-height: 1.6;">
                Ce lien expire dans <strong>1 heure</strong>.
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} GarapExpress - Tous droits réservés</p>
            </div>
          </div>
        `,
      };

      await this.transporter!.sendMail(mailOptions);
      console.log(`Email de réinitialisation envoyé à ${email}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, verificationCode: string): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('⚠️  Email service not configured - skipping verification email');
      return false;
    }

    try {
      const mailOptions = {
        from: `"GarapExpress" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Vérification de votre compte - GarapExpress',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #4F46E5; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; text-align: center;">GarapExpress</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333;">Vérification de votre compte</h2>
              <p style="color: #666; line-height: 1.6;">
                Merci de vous être inscrit sur GarapExpress. Votre code de vérification est :
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="background-color: #4F46E5; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 5px; display: inline-block;">
                  ${verificationCode}
                </span>
              </div>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Ce code expire dans 24 heures.
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} GarapExpress - Tous droits réservés</p>
            </div>
          </div>
        `,
      };

      await this.transporter!.sendMail(mailOptions);
      console.log(`Email de vérification envoyé à ${email}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
      return false;
    }
  }

  // Envoyer un code de vérification pour la réinitialisation du mot de passe
  async sendPasswordResetCode(email: string, verificationCode: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"GarapExpress" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Code de vérification pour réinitialisation du mot de passe - GarapExpress',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #4F46E5; padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; text-align: center;">GarapExpress</h1>
            </div>
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333;">Code de vérification</h2>
              <p style="color: #666; line-height: 1.6;">
                Vous avez demandé la réinitialisation de votre mot de passe. Votre code de vérification est :
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="background-color: #4F46E5; color: white; padding: 15px 30px; font-size: 32px; font-weight: bold; border-radius: 5px; display: inline-block; letter-spacing: 8px;">
                  ${verificationCode}
                </span>
              </div>
              <p style="color: #666; line-height: 1.6;">
                Ce code expire dans <strong>1 heure</strong>.
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} GarapExpress - Tous droits réservés</p>
            </div>
          </div>
        `,
      };

      await this.transporter!.sendMail(mailOptions);
      console.log(`Code de vérification envoyé à ${email}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du code de vérification:', error);
      return false;
    }
  }
}

export default new EmailService();