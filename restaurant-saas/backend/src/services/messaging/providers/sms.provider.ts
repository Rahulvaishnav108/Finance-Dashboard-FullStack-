import logger from '../../../config/logger';

export class SMSProvider {
  static async send(to: string, message: string): Promise<boolean> {
    try {
      // Mock implementation
      logger.info(`[Mock SMS Provider] Sending SMS to ${to}: ${message}`);
      return true;
    } catch (error) {
      logger.error('Failed to send SMS', { to, error });
      return false;
    }
  }
}