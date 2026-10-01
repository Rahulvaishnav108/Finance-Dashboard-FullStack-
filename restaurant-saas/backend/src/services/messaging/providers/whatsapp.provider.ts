import logger from '../../../config/logger';

export class WhatsAppProvider {
  static async send(to: string, message: string): Promise<boolean> {
    try {
      // Mock implementation
      logger.info(`[Mock WhatsApp Provider] Sending WhatsApp to ${to}: ${message}`);
      return true;
    } catch (error) {
      logger.error('Failed to send WhatsApp message', { to, error });
      return false;
    }
  }
}