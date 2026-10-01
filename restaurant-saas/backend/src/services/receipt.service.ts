import PDFDocument from 'pdfkit';
import { IBill } from '../modules/billing/billing.schema';
import { RestaurantModel } from '../modules/restaurants/restaurants.model';

export class ReceiptService {
  /**
   * Generates a JSON representation of the receipt.
   */
  static async generateReceiptJson(bill: IBill) {
    const restaurant = await RestaurantModel.findById(bill.restaurantId).lean();
    if (!restaurant) throw new Error('Restaurant not found');

    const branding = restaurant.settings?.branding || {};
    const currency = restaurant.settings?.currency || 'USD';
    const dateFormat = restaurant.settings?.dateFormat || 'YYYY-MM-DD';
    const timeFormat = restaurant.settings?.timeFormat || 'HH:mm';

    return {
      restaurant: {
        name: restaurant.name,
        address: restaurant.city || 'Local Branch',
        email: branding.supportEmail || '',
        phone: branding.supportPhone || '',
        logo: branding.logo || null,
        primaryColor: branding.primaryColor || '#000000',
        secondaryColor: branding.secondaryColor || '#333333',
        footerText: branding.footerText || 'Thank you for your business!',
        website: branding.website || ''
      },
      invoiceNumber: bill.invoiceNumber,
      date: bill.paidAt ? bill.paidAt.toISOString() : new Date().toISOString(),
      customer: {
        name: bill.customerName || 'Guest',
        email: bill.customerEmail || '',
        phone: bill.customerPhone || '',
      },
      items: bill.orderIds, // Note: For a fully featured JSON, we'd populate order items here.
      subtotal: bill.subtotal,
      tax: bill.taxAmount,
      discount: bill.discountAmount,
      total: bill.finalAmount,
      paymentMethod: bill.paymentMethod || 'Unknown',
      currency,
      formats: { dateFormat, timeFormat }
    };
  }

  /**
   * Generates a PDF buffer of the receipt using PDFKit in memory.
   */
  static async generateReceiptPdf(bill: IBill): Promise<Buffer> {
    const data = await this.generateReceiptJson(bill);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const primaryColor = data.restaurant.primaryColor;
        const secondaryColor = data.restaurant.secondaryColor;

        // Header
        doc.fillColor(primaryColor).fontSize(24).text(data.restaurant.name, { align: 'center' });
        doc.fillColor(secondaryColor).fontSize(10).text(data.restaurant.address, { align: 'center' });

        if (data.restaurant.phone) {
          doc.text(`Phone: ${data.restaurant.phone}`, { align: 'center' });
        }
        if (data.restaurant.email) {
          doc.text(`Email: ${data.restaurant.email}`, { align: 'center' });
        }
        if (data.restaurant.website) {
          doc.text(`Web: ${data.restaurant.website}`, { align: 'center' });
        }

        doc.moveDown();
        doc.fillColor(primaryColor).fontSize(16).text('RECEIPT', { align: 'center' });
        doc.moveDown();

        // Reset to default text color for body
        doc.fillColor('#000000');

        // Invoice Info
        doc.fontSize(10)
           .text(`Invoice Number: ${data.invoiceNumber || 'N/A'}`)
           .text(`Date: ${new Date(data.date).toLocaleString()}`);

        if (data.customer.name !== 'Guest') {
          doc.text(`Customer: ${data.customer.name}`);
        }
        doc.moveDown();

        // Items Header
        doc.fillColor(primaryColor).font('Helvetica-Bold');
        doc.text('Description', 50, doc.y, { continued: true })
           .text('Amount', 400, doc.y, { align: 'right' });
        doc.fillColor('#000000').font('Helvetica');
        doc.moveDown(0.5);

        // Note: Real items would be iterated here. Since orderIds is currently an array of ObjectIds in this scope,
        // a full implementation would populate the orders. For MVP, we'll summarize.
        doc.text('Order Items Included', 50, doc.y, { continued: true })
           .text(`${data.currency} ${data.subtotal.toFixed(2)}`, 400, doc.y, { align: 'right' });
        doc.moveDown();

        // Totals
        doc.moveDown();
        doc.text(`Subtotal:`, 300, doc.y, { continued: true, align: 'right' })
           .text(`${data.currency} ${data.subtotal.toFixed(2)}`, 400, doc.y, { align: 'right' });

        doc.text(`Tax:`, 300, doc.y, { continued: true, align: 'right' })
           .text(`${data.currency} ${data.tax.toFixed(2)}`, 400, doc.y, { align: 'right' });

        if (data.discount > 0) {
          doc.text(`Discount:`, 300, doc.y, { continued: true, align: 'right' })
             .text(`-${data.currency} ${data.discount.toFixed(2)}`, 400, doc.y, { align: 'right' });
        }

        doc.font('Helvetica-Bold');
        doc.text(`Total:`, 300, doc.y, { continued: true, align: 'right' })
           .text(`${data.currency} ${data.total.toFixed(2)}`, 400, doc.y, { align: 'right' });
        doc.font('Helvetica');

        // Footer
        doc.moveDown(3);
        doc.fillColor(secondaryColor).fontSize(10).text(data.restaurant.footerText, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}