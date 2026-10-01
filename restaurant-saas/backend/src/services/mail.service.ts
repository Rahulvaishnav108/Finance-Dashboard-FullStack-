// src/services/mail.service.ts
// Nodemailer wrapper for sending emails

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import logger from '../config/logger';
import { EmailLogModel, EmailType, EmailStatus } from '../modules/notifications/emailLog.model';
import { RestaurantModel } from '../modules/restaurants/restaurants.model';

// Email Subject Constants
export const EMAIL_SUBJECTS = {
  OTP: 'Your verification code',
  PASSWORD_RESET: 'Reset your password',
  STAFF_INVITATION: 'You have been invited to join the staff',
  RESERVATION_CONFIRMATION: 'Reservation Confirmed',
  LOW_STOCK_ALERT: 'Inventory Low Stock Alert',
  DAILY_SALES_REPORT: 'Daily Sales Report',
  RECEIPT: 'Your Payment Receipt',
  PASSWORD_CHANGED_ALERT: 'Security Alert: Your Password Was Changed',
};

let transporter: nodemailer.Transporter | null = null;

/**
 * Get or create the email transporter.
 * Only initializes if SMTP config is present.
 */
export function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  console.log('getTransporter called. NODE_ENV:', env.NODE_ENV, 'SMTP_HOST:', env.SMTP_HOST);

  if (env.NODE_ENV !== 'test' && (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS)) {
    logger.warn('SMTP not configured - email sending disabled');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || 'localhost',
    port: env.SMTP_PORT || 587,
    auth: {
      user: env.SMTP_USER || 'test',
      pass: env.SMTP_PASS || 'test',
    },
  });

  return transporter;
}

/**
 * Verify SMTP connection on startup.
 */
export async function verifySmtpConnection(): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) return false;

  try {
    await transport.verify();
    logger.info('📧 SMTP Connection Verified - Ready to send emails');
    return true;
  } catch (error) {
    console.error('SMTP Connection Failed ERROR', error);
    logger.error('❌ SMTP Connection Failed:', { error });
    return false;
  }
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  emailType?: EmailType;
  restaurantId?: string;
}

/**
 * Send an email. Silently logs and returns false if SMTP is not configured.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transport = getTransporter();

  // Check email preferences if restaurantId is provided
  if (options.restaurantId && options.emailType) {
    const restaurant = await RestaurantModel.findById(options.restaurantId).lean();
    if (restaurant && restaurant.settings.emailPreferences) {
      const prefs = restaurant.settings.emailPreferences;
      if (options.emailType === EmailType.DAILY_SALES_REPORT && prefs.dailySalesReports === false) {
        logger.info(`Skipping Daily Sales Report for restaurant ${options.restaurantId} due to preferences`);
        return false;
      }
      if (options.emailType === EmailType.LOW_STOCK_ALERT && prefs.inventoryAlerts === false) {
        logger.info(`Skipping Inventory Alert for restaurant ${options.restaurantId} due to preferences`);
        return false;
      }
      if (options.emailType === EmailType.STAFF_INVITATION && prefs.staffNotifications === false) {
        logger.info(`Skipping Staff Invitation for restaurant ${options.restaurantId} due to preferences`);
        return false;
      }
    }
  }

  if (!transport) {
    logger.info(`📧 Email not sent (SMTP not configured): ${options.subject} → ${options.to}`);
    // In development, log the email content for debugging
    if (env.NODE_ENV === 'development') {
      logger.debug('Email content:', { to: options.to, subject: options.subject });
    }
    return false;
  }

  try {
    let finalHtml = options.html;
    if (options.restaurantId) {
      const restaurant = await RestaurantModel.findById(options.restaurantId).select('settings.branding').lean();

      const branding = restaurant?.settings?.branding || {};
      const primaryColor = branding.primaryColor || '#000000';
      const logo = branding.logo ? `<img src="${branding.logo}" alt="Logo" style="max-height: 60px; margin-bottom: 20px;" />` : '';
      const footerText = branding.footerText || '';
      const contactStr = [branding.supportEmail, branding.supportPhone, branding.website].filter(Boolean).join(' | ');

      finalHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-top: 4px solid ${primaryColor}; border-radius: 4px;">
          <div style="padding: 20px; text-align: center; border-bottom: 1px solid #eee;">
            ${logo}
          </div>
          <div style="padding: 20px;">
            ${options.html}
          </div>
          <div style="padding: 20px; text-align: center; font-size: 12px; color: #888; background-color: #f9f9f9;">
            <p>${footerText}</p>
            <p>${contactStr}</p>
          </div>
        </div>
      `;
    }

    const info = await transport.sendMail({
      from: env.SMTP_FROM || 'noreply@restaurant-saas.com',
      to: options.to,
      subject: options.subject,
      html: finalHtml,
      text: options.text,
    });

    if (options.emailType) {
      await EmailLogModel.create({
        emailType: options.emailType,
        recipient: options.to,
        status: EmailStatus.SENT,
        provider: 'SMTP',
        messageId: info.messageId,
        restaurantId: options.restaurantId,
      }).catch(e => logger.error('Failed to save email log', e));
    }

    logger.info(`📧 Email sent successfully: ${options.subject} → ${options.to}`, { messageId: info.messageId });
    return true;
  } catch (error: any) {
    if (options.emailType) {
      await EmailLogModel.create({
        emailType: options.emailType,
        recipient: options.to,
        status: EmailStatus.FAILED,
        provider: 'SMTP',
        failureReason: error.message,
        restaurantId: options.restaurantId,
      }).catch(e => logger.error('Failed to save email log', e));
    }
    console.error('sendEmail catch block error:', error);

    logger.error('Failed to send email:', {
      error: error.message,
      stack: error.stack,
      to: options.to,
      subject: options.subject
    });
    return false;
  }
}

// Template Caching
const templatesCache: Record<string, string> = {};

function getTemplate(templateName: string): string {
  if (templatesCache[templateName]) {
    return templatesCache[templateName];
  }

  const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.html`);
  try {
    const content = fs.readFileSync(templatePath, 'utf-8');
    templatesCache[templateName] = content;
    return content;
  } catch (error) {
    logger.error(`Template not found or failed to load: ${templatePath}`, { error });
    throw new Error(`Email template ${templateName} not found`);
  }
}

/**
 * Send OTP email.
 */
export async function sendOTPEmail(to: string, otp: string, expiryMinutes: number = 2): Promise<boolean> {
  try {
    let html = getTemplate('otp');
    html = html.replace('{{otp}}', otp);
    html = html.replace(/\{\{otpExpiryMinutes\}\}/g, String(expiryMinutes));

    return await sendEmail({
      to,
      subject: EMAIL_SUBJECTS.OTP,
      html,
    });
  } catch (error) {
    logger.error('Failed to prepare or send OTP email', { error, to });
    return false;
  }
}

/**
 * Send password reset email.
 */
export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
  try {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;

    let html = getTemplate('password-reset');
    html = html.replace('{{resetUrl}}', resetUrl);

    return await sendEmail({
      to,
      subject: EMAIL_SUBJECTS.PASSWORD_RESET,
      html,
    });
  } catch (error) {
    logger.error('Failed to prepare or send password reset email', { error, to });
    return false;
  }
}

/**
 * Send staff invitation email.
 */
export async function sendStaffInvitationEmail(
  email: string,
  staffName: string,
  temporaryPassword: string,
  loginUrl: string,
  restaurantName: string = 'Our Restaurant'
): Promise<boolean> {
  try {
    let html = getTemplate('staff-invitation');

    html = html.replace(/\{\{restaurantName\}\}/g, restaurantName);
    html = html.replace(/\{\{staffName\}\}/g, staffName);
    html = html.replace(/\{\{temporaryPassword\}\}/g, temporaryPassword);
    html = html.replace(/\{\{loginUrl\}\}/g, loginUrl);

    return await sendEmail({
      to: email,
      subject: EMAIL_SUBJECTS.STAFF_INVITATION,
      html,
    });
  } catch (error) {
    logger.error('Failed to prepare or send staff invitation email', { error, email });
    return false;
  }
}

/**
 * Send reservation confirmation email.
 */
export async function sendReservationConfirmationEmail(
  email: string,
  customerName: string,
  restaurantName: string,
  date: string,
  time: string,
  guests: number,
  tableInfo: string,
  contactInfo: string,
  notes: string = ''
): Promise<boolean> {
  try {
    let html = getTemplate('reservation-confirmation');

    html = html.replace(/\{\{customerName\}\}/g, customerName);
    html = html.replace(/\{\{restaurantName\}\}/g, restaurantName);
    html = html.replace(/\{\{date\}\}/g, date);
    html = html.replace(/\{\{time\}\}/g, time);
    html = html.replace(/\{\{guests\}\}/g, String(guests));
    html = html.replace(/\{\{tableInfo\}\}/g, tableInfo);
    html = html.replace(/\{\{contactInfo\}\}/g, contactInfo);

    const notesHtml = notes ? `
      <div class="detail-row">
        <span class="detail-label">Notes</span>
        <span class="detail-value">${notes}</span>
      </div>
    ` : '';
    html = html.replace(/\{\{notesHtml\}\}/g, notesHtml);

    return await sendEmail({
      to: email,
      subject: EMAIL_SUBJECTS.RESERVATION_CONFIRMATION,
      html,
    });
  } catch (error) {
    logger.error('Failed to prepare or send reservation confirmation email', { error, email });
    return false;
  }
}

/**
 * Send low stock alert email.
 */
export async function sendLowStockAlertEmail(
  email: string,
  restaurantName: string,
  itemName: string,
  currentStock: number,
  threshold: number,
  unit: string
): Promise<boolean> {
  try {
    let html = getTemplate('low-stock-alert');

    html = html.replace(/\{\{restaurantName\}\}/g, restaurantName);
    html = html.replace(/\{\{itemName\}\}/g, itemName);
    html = html.replace(/\{\{currentStock\}\}/g, String(currentStock));
    html = html.replace(/\{\{threshold\}\}/g, String(threshold));
    html = html.replace(/\{\{unit\}\}/g, unit);

    return await sendEmail({
      to: email,
      subject: EMAIL_SUBJECTS.LOW_STOCK_ALERT,
      html,
    });
  } catch (error) {
    logger.error('Failed to prepare or send low stock alert email', { error, email });
    return false;
  }
}
export async function sendDailySalesReportEmail(
  email: string,
  restaurantName: string,
  reportDate: string,
  totalOrders: number,
  revenue: number,
  paidBills: number,
  cancelledOrders: number,
  averageOrderValue: number,
  topSellingItems: Array<{ name: string; quantity: number }>
): Promise<boolean> {
  try {
    let html = getTemplate('daily-sales-report');

    const currencySymbol = '₹'; // Assuming INR for now, could be passed as argument if multi-currency

    // Format top selling items as HTML list
    const topItemsHtml = topSellingItems.length > 0
      ? topSellingItems.map(item => `<li>${item.name}: ${item.quantity} units</li>`).join('')
      : '<li>No items sold today</li>';

    html = html.replace(/\{\{restaurantName\}\}/g, restaurantName);
    html = html.replace(/\{\{reportDate\}\}/g, reportDate);
    html = html.replace(/\{\{totalOrders\}\}/g, String(totalOrders));
    html = html.replace(/\{\{revenue\}\}/g, `${currencySymbol}${revenue.toFixed(2)}`);
    html = html.replace(/\{\{paidBills\}\}/g, String(paidBills));
    html = html.replace(/\{\{cancelledOrders\}\}/g, String(cancelledOrders));
    html = html.replace(/\{\{averageOrderValue\}\}/g, `${currencySymbol}${averageOrderValue.toFixed(2)}`);
    html = html.replace(/\{\{topSellingItems\}\}/g, topItemsHtml);

    return await sendEmail({
      to: email,
      subject: `${EMAIL_SUBJECTS.DAILY_SALES_REPORT} - ${reportDate}`,
      html,
    });
  } catch (error) {
    logger.error('Failed to prepare or send daily sales report email', { error, email });
    return false;
  }
}

export function resetTransporterForTests() { transporter = null; }

/**
 * Send Receipt Email
 */
export async function sendReceiptEmail(
  email: string,
  details: {
    restaurantName: string;
    invoiceNumber: string;
    customerName: string;
    customerPhone: string;
    orderItems: Array<{ name: string; quantity: number; price: number; totalPrice: number }>;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    paymentMethod: string;
    paymentDate: string;
  }
): Promise<boolean> {
  try {
    let html = getTemplate('receipt');

    const currencySymbol = '₹';

    const orderItemsHtml = details.orderItems.length > 0
      ? details.orderItems.map(item => `
          <tr>
            <td>${item.name}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${currencySymbol}${item.totalPrice.toFixed(2)}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="3">No items</td></tr>';

    html = html.replace(/\{\{restaurantName\}\}/g, details.restaurantName);
    html = html.replace(/\{\{invoiceNumber\}\}/g, details.invoiceNumber);
    html = html.replace(/\{\{paymentDate\}\}/g, details.paymentDate);
    html = html.replace(/\{\{customerName\}\}/g, details.customerName || 'Guest');
    html = html.replace(/\{\{customerPhone\}\}/g, details.customerPhone || '');
    html = html.replace(/\{\{paymentMethod\}\}/g, details.paymentMethod);
    html = html.replace(/\{\{orderItemsHtml\}\}/g, orderItemsHtml);
    html = html.replace(/\{\{subtotal\}\}/g, `${currencySymbol}${details.subtotal.toFixed(2)}`);
    html = html.replace(/\{\{taxAmount\}\}/g, `${currencySymbol}${details.taxAmount.toFixed(2)}`);
    html = html.replace(/\{\{totalAmount\}\}/g, `${currencySymbol}${details.totalAmount.toFixed(2)}`);

    return await sendEmail({
      to: email,
      subject: `${EMAIL_SUBJECTS.RECEIPT} - ${details.invoiceNumber}`,
      html,
    });
  } catch (error) {
    logger.error('Failed to prepare or send receipt email', { error, email, invoiceNumber: details.invoiceNumber });
    return false;
  }
}

/**
 * Send Password Changed Security Alert Email
 */
export async function sendPasswordChangedAlertEmail(
  email: string,
  name: string,
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> {
  try {
    let html = getTemplate('password-changed-alert');

    const datetime = new Date().toLocaleString('en-US', { timeZoneName: 'short' });
    const ipHtml = ipAddress ? `<p><strong>IP Address:</strong> ${ipAddress}</p>` : '';
    const deviceHtml = userAgent ? `<p><strong>Device/Browser:</strong> ${userAgent}</p>` : '';

    html = html.replace(/\{\{name\}\}/g, name || 'User');
    html = html.replace(/\{\{email\}\}/g, email);
    html = html.replace(/\{\{datetime\}\}/g, datetime);
    html = html.replace(/\{\{ipHtml\}\}/g, ipHtml);
    html = html.replace(/\{\{deviceHtml\}\}/g, deviceHtml);

    return await sendEmail({
      to: email,
      subject: EMAIL_SUBJECTS.PASSWORD_CHANGED_ALERT,
      html,
      emailType: EmailType.PASSWORD_CHANGED_ALERT,
    });
  } catch (error) {
    logger.error('Failed to prepare or send password changed alert email', { error, email });
    return false;
  }
}