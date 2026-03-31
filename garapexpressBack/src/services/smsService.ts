import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

class SmsService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_FROM || '';

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    this.client = twilio(accountSid, authToken);
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    try {
      // Formater le numéro pour Twilio (enlever les espaces et ajouter + si nécessaire)
      let formattedPhone = phoneNumber.replace(/\s/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      const message = await this.client.messages.create({
        body: `Votre code de vérification GarapExpress est: ${code}`,
        from: this.fromNumber,
        to: formattedPhone,
      });

      console.log(`SMS sent successfully to ${formattedPhone}: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  async sendCustomMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      let formattedPhone = phoneNumber.replace(/\s/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedPhone,
      });

      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }
}

export default new SmsService();