

import React, { useEffect, useRef, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (tableId: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }: Props) {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [cameraSupport, setCameraSupport] = useState(true);
  const [manualTableId, setManualTableId] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [scanRetryTrigger, setScanRetryTrigger] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Reset scanner states when modal is toggled open
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setScanned(false);
      setHasTimedOut(false);
      setManualTableId('');
      setShowManualInput(false);
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = manualTableId.trim().toUpperCase();
    if (!cleanId) return;
    setScanned(true);
    setTimeout(() => {
      onScanSuccess(cleanId);
    }, 800);
  };

  const handleSimulateScan = () => {
    setScanned(true);
    setTimeout(() => {
      onScanSuccess('T07'); // Default mock table
    }, 1000);
  };

  const handleRetryScan = () => {
    setScanned(false);
    setHasTimedOut(false);
    setShowManualInput(false);
    setScanRetryTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    // Start 10-second timeout timer
    const timeoutTimer = setTimeout(() => {
      if (isMounted && !scanned) {
        setHasTimedOut(true);
      }
    }, 10000);

    // Request camera stream safely without taking photos
    if (navigator?.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          if (isMounted) {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.setAttribute('playsinline', 'true');
              videoRef.current.play().catch(e => console.error("Error playing video:", e));
            }
            setCameraActive(true);
            setCameraSupport(true);
          }
        })
        .catch((err) => {
          console.warn("Camera permission denied or not available:", err);
          if (isMounted) {
            setCameraActive(false);
            setCameraSupport(false);
          }
        });
    } else {
      console.warn("navigator.mediaDevices or getUserMedia is not supported in this browser context.");
      if (isMounted) {
        Promise.resolve().then(() => {
          if (!isMounted) return;
          setCameraActive(false);
          setCameraSupport(false);
        });
      }
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutTimer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, scanned, scanRetryTrigger]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0f0f12]/95 backdrop-blur-md z-[200] flex flex-col items-center justify-between p-6 text-white animate-fadeIn">
      <style>{`
        @keyframes scan-line {
          0%, 100% { top: 16px; }
          50% { top: calc(100% - 16px); }
        }
        @keyframes pulse-viewfinder {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-scan-line {
          animation: scan-line 2.2s ease-in-out infinite;
        }
        .animate-pulse-viewfinder {
          animation: pulse-viewfinder 2s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div className="w-full flex justify-between items-center max-w-md mt-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sd-primary-container text-[24px]">qr_code_scanner</span>
          <h3 className="text-lg font-bold font-sans tracking-wide">Scan Table QR</h3>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Central Interactive Area */}
      <div className="flex flex-col items-center justify-center my-auto w-full max-w-md">

        {/* State 1: Manual Input Screen */}
        {showManualInput ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 w-full text-center shadow-2xl animate-scaleIn">
            <span className="material-symbols-outlined text-sd-primary-container text-5xl mb-3">pin</span>
            <h4 className="text-lg font-bold font-sans mb-1 text-white">Enter Table Code</h4>
            <p className="text-xs text-white/60 font-sans mb-6">Type the table code displayed on your table sticker</p>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <input
                type="text"
                maxLength={5}
                required
                value={manualTableId}
                onChange={(e) => setManualTableId(e.target.value)}
                placeholder="e.g. T07"
                className="w-full text-center text-xl font-bold uppercase py-3 px-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sd-primary-container text-white placeholder-white/30"
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualInput(false)}
                  className="flex-1 py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-semibold font-sans transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!manualTableId.trim()}
                  className="flex-1 py-3 px-4 bg-sd-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg disabled:opacity-50 transition-all font-sans"
                >
                  Connect Table
                </button>
              </div>
            </form>
          </div>
        ) : scanned ? (
          /* State 2: Success / Checked Screen */
          <div className="relative w-64 h-64 rounded-[2rem] overflow-hidden border border-white/10 bg-black/50 shadow-2xl flex items-center justify-center animate-scaleIn">
            <div className="absolute inset-0 bg-[#0f0f12]/85 flex flex-col items-center justify-center gap-3">
              <div className="w-20 h-20 bg-sd-secondary rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(0,110,47,0.4)] scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl font-bold">done</span>
              </div>
              <p className="text-sm font-bold font-sans text-sd-secondary-container">Scanned successfully!</p>
            </div>
          </div>
        ) : hasTimedOut ? (
          /* State 3: Timeout Screen */
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 w-full text-center shadow-2xl animate-scaleIn">
            <span className="material-symbols-outlined text-rose-500 text-5xl mb-3">warning</span>
            <h4 className="text-lg font-bold font-sans mb-1 text-white">QR Code Not Recognized</h4>
            <p className="text-xs text-white/60 font-sans mb-6 leading-relaxed max-w-[280px] mx-auto">
              We couldn&apos;t detect a table QR code in 10 seconds. Make sure it is centered in the frame.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleRetryScan}
                className="w-full py-3 bg-sd-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all font-sans flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
                Retry Scan
              </button>
              <button
                onClick={() => setShowManualInput(true)}
                className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all font-sans flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">keyboard</span>
                Enter Table ID Manually
              </button>
            </div>
          </div>
        ) : (
          /* State 4: Active Scanning Viewfinder Screen */
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64 rounded-[2rem] overflow-hidden border border-white/10 bg-black/50 shadow-2xl flex items-center justify-center">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover rounded-[2rem]"
                  muted
                  playsInline
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 gap-3 select-none">
                  <div className="w-16 h-16 bg-sd-primary-container/10 border border-sd-primary-container/30 rounded-2xl flex items-center justify-center text-sd-primary-container animate-pulse">
                    <span className="material-symbols-outlined text-4xl">
                      {cameraSupport ? 'qr_code_2' : 'videocam_off'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold font-sans">
                      {cameraSupport ? 'Connecting Camera Feed...' : 'Camera Access Disabled'}
                    </p>
                    <p className="text-[10px] text-white/50 font-sans max-w-[200px] leading-relaxed">
                      {!window.isSecureContext
                        ? 'Camera access requires HTTPS or localhost. Scan or type below...'
                        : 'Please fit the table QR code inside the viewfinder box.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Viewfinder borders overlay */}
              <>
                <div className="absolute top-4 left-4 w-6 h-6 border-t-[4px] border-l-[4px] border-sd-primary-container rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-[4px] border-r-[4px] border-sd-primary-container rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-[4px] border-l-[4px] border-sd-primary-container rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-[4px] border-r-[4px] border-sd-primary-container rounded-br-lg" />

                {/* Scanning Red Laser Line */}
                <div className="absolute left-4 right-4 h-[3px] bg-sd-primary-container shadow-[0_0_12px_#ff5c00] rounded-full animate-scan-line" />
              </>
            </div>

            <p className="text-xs text-white/70 font-sans text-center mt-6 max-w-xs px-4">
              Point your camera at the Smart Dining QR code placed on your table.
            </p>

            <div className="flex flex-col gap-2.5 mt-4 w-full px-4 items-center">
              {/* Simulate QR Scan Button for Demo */}
              <button
                onClick={handleSimulateScan}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl text-xs font-semibold text-white/95 transition-all active:scale-95 flex items-center gap-2 font-sans"
              >
                <span className="material-symbols-outlined text-[16px] text-sd-primary-container">sensors</span>
                Simulate QR Detection
              </button>

              {/* Manual Entry Fallback Button */}
              <button
                onClick={() => setShowManualInput(true)}
                className="text-xs text-sd-primary-container hover:underline font-semibold font-sans mt-1"
              >
                Enter Table ID Manually
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-xs flex items-center justify-center gap-2.5 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 mb-4 select-none">
        <span className="material-symbols-outlined text-white/50 text-[18px]">info</span>
        <span className="text-[11px] text-white/60 font-sans font-medium">Scanning or entering code connects your table</span>
      </div>
    </div>
  );
}
