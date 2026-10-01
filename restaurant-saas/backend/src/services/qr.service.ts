import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { env } from '../config/env';

export async function generateQrPng(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, { type: 'png', margin: 2, width: 300 });
}

export async function generateQrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: 'svg', margin: 2 });
}

function formatTableLabel(num: string): string {
  const match = num.match(/^([A-Za-z]+)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const digits = parseInt(match[2], 10);
    const padded = digits < 10 ? `0${digits}` : `${digits}`;
    return `${prefix}-${padded}`;
  }
  return num;
}

export async function generateTablesPdf(
  tables: Array<{ tableNumber: string; section: string; qrToken: string; floor?: number }>,
  _restaurantName: string
): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 30 });
  const buffers: Buffer[] = [];

  const streamPromise = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));
  });

  const cardWidth = 240;
  const cardHeight = 220;
  const colSpacing = 30;
  const rowSpacing = 20;
  const startX = 40;

  let count = 0;

  for (const table of tables) {
    if (count > 0 && count % 6 === 0) {
      doc.addPage();
    }

    const pageIndex = count % 6;
    const col = pageIndex % 2;
    const row = Math.floor(pageIndex / 2);

    // Page 1 has title, so we shift startY down
    const isPageOne = count < 6;
    if (count === 0) {
      // Draw Title on page 1
      doc.font('Helvetica-Bold')
        .fontSize(20)
        .fillColor('#0F172A')
        .text('Restaurant Table QR Codes', startX, 35);
    }

    const startY = isPageOne ? 75 : 40;
    const x = startX + col * (cardWidth + colSpacing);
    const y = startY + row * (cardHeight + rowSpacing);

    // Draw Card border (rounded rectangle)
    doc.roundedRect(x, y, cardWidth, cardHeight, 15)
      .lineWidth(1)
      .strokeColor('#E2E8F0')
      .stroke();

    // Table Number top-left
    doc.font('Helvetica-Bold')
      .fontSize(18)
      .fillColor('#0F172A')
      .text(formatTableLabel(table.tableNumber), x + 20, y + 20);

    // Section & Floor subtitle
    const subtitle = `${table.section || 'Main'} • Floor ${table.floor || 1}`;
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#64748B')
      .text(subtitle, x + 20, y + 42);

    // QR Code URL
    const scanUrl = `${env.CLIENT_URL}/customer/home?qr_token=${table.qrToken}`;
    const qrBuffer = await generateQrPng(scanUrl);

    // Embed QR Code Image
    const qrSize = 120;
    const qrX = x + (cardWidth - qrSize) / 2;
    const qrY = y + 75;
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    count++;
  }

  doc.end();
  return streamPromise;
}
