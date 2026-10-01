// src/features/admin/components/tables/TableQRCode.tsx
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import { useTablesStore } from '../../store/tables.store';
import { Download, Printer, RefreshCw, Eye, X } from 'lucide-react';

interface TableQRCodeProps {
  tableId: string;
  tableLabel: string;
  floor: number;
  section?: string;
  size?: number;
  qrToken?: string;
}

function formatLabel(num: string): string {
  const match = num.match(/^([A-Za-z]+)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const digits = parseInt(match[2], 10);
    const padded = digits < 10 ? `0${digits}` : `${digits}`;
    return `${prefix}-${padded}`;
  }
  return num;
}

export function TableQRCode({
  tableId,
  tableLabel,
  floor,
  section,
  size = 120,
  qrToken,
}: TableQRCodeProps): JSX.Element {
  const [showPreview, setShowPreview] = useState(false);
  const { regenerateQrCode } = useTablesStore();

  const token = qrToken || tableId;
  const scanUrl = `${window.location.origin}/customer/home?qr_token=${token}`;
  const formattedLabel = formatLabel(tableLabel);
  const subtitle = `${section || 'Main'} • Floor ${floor}`;

  // Helper to generate the exact card as a canvas element client-side
  const generateCardCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 440;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // 1. Draw card background (white with rounded corners)
    ctx.fillStyle = '#ffffff';

    // Draw rounded rectangle path
    const r = 30;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(canvas.width - r, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
    ctx.lineTo(canvas.width, canvas.height - r);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
    ctx.lineTo(r, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();

    // Draw border
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 2. Draw Table Label (top-left)
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 36px font-sans, system-ui, -apple-system, sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText(formattedLabel, 35, 35);

    // 3. Draw Subtitle
    ctx.fillStyle = '#64748B';
    ctx.font = '600 20px font-sans, system-ui, -apple-system, sans-serif';
    ctx.fillText(subtitle, 35, 85);

    // 4. Generate QR Code and draw in center
    const qrDataUrl = await QRCode.toDataURL(scanUrl, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'H',
    });

    const qrImg = new window.Image();
    await new Promise<void>((resolve) => {
      qrImg.onload = () => resolve();
      qrImg.src = qrDataUrl;
    });

    const qrSize = 240;
    const qrX = (canvas.width - qrSize) / 2;
    const qrY = 150;
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    return canvas;
  };

  const handleDownload = async () => {
    try {
      const canvas = await generateCardCanvas();
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `table-${formattedLabel}-qr.png`;
      link.click();
    } catch (error) {
      console.error('Failed to download QR card', error);
    }
  };

  const handlePrint = async () => {
    try {
      const qrDataUrl = await QRCode.toDataURL(scanUrl, {
        width: 240,
        margin: 1,
        errorCorrectionLevel: 'H',
      });

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Table ${formattedLabel}</title>
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background-color: #ffffff;
                font-family: system-ui, -apple-system, sans-serif;
              }
              .card {
                background: #ffffff;
                border: 1.5px solid #e2e8f0;
                border-radius: 30px;
                width: 440px;
                height: 400px;
                padding: 35px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                gap: 15px;
              }
              .header {
                text-align: left;
              }
              .title {
                font-size: 32px;
                font-weight: 800;
                color: #0f172a;
                margin: 0 0 6px 0;
              }
              .subtitle {
                font-size: 16px;
                color: #64748b;
                margin: 0;
              }
              .qr-container {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 15px;
              }
              .qr-container img {
                width: 220px;
                height: 220px;
              }
              @media print {
                body {
                  background: none;
                }
                .card {
                  box-shadow: none;
                  border: 1.5px solid #e2e8f0;
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <h1 class="title">${formattedLabel}</h1>
                <p class="subtitle">${subtitle}</p>
              </div>
              <div class="qr-container">
                <img src="${qrDataUrl}" alt="QR Code" />
              </div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 300);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Failed to print QR card', error);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm(`Are you sure you want to regenerate the QR code for ${tableLabel}? Old printouts will stop working.`)) {
      return;
    }
    try {
      await regenerateQrCode(tableId);
    } catch (error) {
      console.error('Failed to regenerate QR', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* QR Code Icon Grid View Trigger */}
      <button
        type="button"
        className="rounded-2xl bg-white p-3 shadow-md border border-gray-150 dark:border-zinc-800 flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform"
        onClick={() => setShowPreview(true)}
        title="Click to preview QR"
      >
        <QRCodeSVG
          value={scanUrl}
          size={size}
          level="H"
          bgColor="#ffffff"
          fgColor="#0f172a"
        />
      </button>

      {/* Quick Action Buttons */}
      <div className="flex gap-2 w-full justify-center">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded-xl transition-all"
          title="Preview QR"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-zinc-850 dark:hover:bg-zinc-800 dark:text-zinc-300 rounded-xl transition-all"
          title="Download PNG"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-zinc-850 dark:hover:bg-zinc-800 dark:text-zinc-300 rounded-xl transition-all"
          title="Print QR"
        >
          <Printer className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleRegenerate}
          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 rounded-xl transition-all"
          title="Regenerate QR"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center flex flex-col items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 mb-6">QR Code Card Preview</h3>

              {/* Exact replication of card layout matching img 2 */}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 w-[280px] h-[260px] flex flex-col justify-between text-left shadow-inner mb-6 select-none">
                <div>
                  <h4 className="text-2xl font-extrabold text-slate-900 font-sans leading-none mb-1">
                    {formattedLabel}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 font-sans">
                    {subtitle}
                  </p>
                </div>
                <div className="flex justify-center items-center mt-3">
                  <QRCodeSVG
                    value={scanUrl}
                    size={135}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                  />
                </div>
              </div>

              {/* Action grid */}
              <div className="grid grid-cols-3 gap-2.5 w-full">
                <button
                  onClick={handleDownload}
                  className="flex flex-col items-center gap-1 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all"
                >
                  <Download className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-zinc-400">Download</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex flex-col items-center gap-1 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all"
                >
                  <Printer className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-zinc-400">Print</span>
                </button>
                <button
                  onClick={handleRegenerate}
                  className="flex flex-col items-center gap-1 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-xl transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-[10px] font-semibold text-red-600 dark:text-red-400">Regenerate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
