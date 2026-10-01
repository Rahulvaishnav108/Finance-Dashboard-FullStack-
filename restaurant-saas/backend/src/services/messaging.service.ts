import { SMSProvider } from './messaging/providers/sms.provider';
import { WhatsAppProvider } from './messaging/providers/whatsapp.provider';
import { getMessageTemplate } from './messageTemplate.service';

export class MessagingService {
  /**
   * Send SMS using the abstract provider and template system
   */
  static async sendSMS(to: string, templateName: string, data: Record<string, string>): Promise<boolean> {
    let message = getMessageTemplate(templateName);
    for (const [key, value] of Object.entries(data)) {
      message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return await SMSProvider.send(to, message);
  }

  /**
   * Send WhatsApp using the abstract provider and template system
   */
  static async sendWhatsApp(to: string, templateName: string, data: Record<string, string>): Promise<boolean> {
    let message = getMessageTemplate(templateName);
    for (const [key, value] of Object.entries(data)) {
      message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return await WhatsAppProvider.send(to, message);
  }
}