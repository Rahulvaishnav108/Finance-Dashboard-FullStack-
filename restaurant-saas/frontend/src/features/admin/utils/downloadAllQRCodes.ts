// src/features/admin/utils/downloadAllQRCodes.ts
// Generates a PDF of QR codes for all tables using backend bulk PDF or jsPDF client fallback

import QRCode from 'qrcode';
import { apiClient } from '../../../shared/services/apiClient';
import type { Table } from '../store/tables.store';

/**
 * Generates and downloads a PDF containing QR codes for all provided tables.
 * Calls backend dynamic A4 PDF first, falls back to client-side generation.
 */
export async function downloadAllQRCodes(tables: Table[], restaurantId?: string): Promise<void> {
  if (tables.length === 0) return;
  if (restaurantId) {
    try {
      const response = await apiClient.get(`/restaurants/${restaurantId}/qrs/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `restaurant-qr-codes.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      return;
    } catch (error) {
      console.error('Failed to download bulk PDF from backend, falling back to client-side generation', error);
    }
  }

  // Client-side fallback:
  // Dynamically import jsPDF to keep the bundle lean
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const baseUrl = window.location.origin;

  const cardWidth = 85;
  const cardHeight = 75;
  const gapX = 10;
  const gapY = 8;
  const marginX = 15;

  let count = 0;

  const formatLabel = (num: string): string => {
    const match = num.match(/^([A-Za-z]+)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const digits = parseInt(match[2], 10);
      const padded = digits < 10 ? `0${digits}` : `${digits}`;
      return `${prefix}-${padded}`;
    }
    return num;
  };

  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    const token = table.qr_token || table.id;
    const scanUrl = `${baseUrl}/customer/home?qr_token=${token}`;

    if (count > 0 && count % 6 === 0) {
      doc.addPage();
    }

    const pageIndex = count % 6;
    const col = pageIndex % 2;
    const row = Math.floor(pageIndex / 2);

    // Title on first page
    if (count === 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text('Restaurant Table QR Codes', marginX, 15);
    }

    const startY = count < 6 ? 23 : 15;
    const x = marginX + col * (cardWidth + gapX);
    const y = startY + row * (cardHeight + gapY);

    // Generate QR code data URL offline
    const dataUrl = await QRCode.toDataURL(scanUrl, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: 'H',
    });

    // Draw Card border (rounded rectangle)
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y, cardWidth, cardHeight, 5, 5, 'S');

    // Draw Table label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(formatLabel(table.label), x + 7, y + 8);

    // Draw Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`${table.section} • Floor ${table.floor}`, x + 7, y + 14);

    // Embed QR Code
    const qrSize = 42;
    const qrX = x + (cardWidth - qrSize) / 2;
    const qrY = y + 23;
    doc.addImage(dataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    count++;
  }

  doc.save('table-qr-codes.pdf');
}
