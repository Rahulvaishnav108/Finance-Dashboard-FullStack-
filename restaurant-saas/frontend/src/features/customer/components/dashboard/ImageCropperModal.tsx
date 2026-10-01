import React, { useState, useEffect, useRef } from 'react';

interface Props {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onConfirm: (croppedImageBase64: string) => void;
}

export default function ImageCropperModal({ isOpen, imageSrc, onClose, onConfirm }: Props) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const VIEWPORT_SIZE = 280;

  useEffect(() => {
    if (!imageSrc || !isOpen) return;

    setImageLoaded(false);
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });

      // Compute scale so image covers the circular viewport
      let scale = 1;
      if (img.width > img.height) {
        scale = VIEWPORT_SIZE / img.height;
      } else {
        scale = VIEWPORT_SIZE / img.width;
      }

      setBaseScale(scale);
      setZoom(1);

      // Center the image within the viewport initially
      const initX = (VIEWPORT_SIZE - img.width * scale) / 2;
      const initY = (VIEWPORT_SIZE - img.height * scale) / 2;
      setPosition({ x: initX, y: initY });
      setImageLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc, isOpen]);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUpOrLeave = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  };

  const handleMove = (clientX: number, clientY: number) => {
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextZoom = parseFloat(e.target.value);

    // Zoom relative to the center of the crop viewport is nice, but since we use origin-0-0
    // let's adjust position slightly to keep the image centered, or let the user adjust with drag.
    // For simplicity and standard behavior, just adjust zoom scale and let the user pan.
    setZoom(nextZoom);
  };

  const handleCrop = () => {
    if (!imageLoaded) return;

    const canvas = document.createElement('canvas');
    // Save high-resolution output (e.g. 500x500)
    const OUTPUT_SIZE = 500;
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We scale coordinates from the viewport size (280) to output size (500)
    const factor = OUTPUT_SIZE / VIEWPORT_SIZE;

    // Clear with transparency
    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    const imgElement = imageRef.current;
    if (imgElement) {
      // Apply translation and scale matching the viewport transforms
      ctx.translate(position.x * factor, position.y * factor);
      ctx.scale(zoom, zoom);

      const drawWidth = imageSize.width * baseScale * factor;
      const drawHeight = imageSize.height * baseScale * factor;

      ctx.drawImage(imgElement, 0, 0, drawWidth, drawHeight);

      // Get base64 string
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
      onConfirm(croppedBase64);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-sd-surface-container rounded-3xl border border-sd-surface-variant w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-scaleIn">

        {/* Header */}
        <div className="px-6 py-4 border-b border-sd-surface-variant bg-sd-surface-container-low flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg font-sans text-sd-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-sd-primary">crop</span>
            Align Profile Image
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-sd-surface hover:bg-sd-surface-container text-sd-on-surface-variant hover:text-sd-on-surface flex items-center justify-center transition-colors border border-sd-surface-variant"
            title="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 overflow-y-auto">

          {/* Crop Viewport container */}
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-full border-4 border-white shadow-2xl bg-sd-surface-container-high cursor-move select-none"
            style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {imageSrc && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Source to Crop"
                className="absolute origin-top-left pointer-events-none max-w-none"
                style={{
                  width: imageSize.width * baseScale,
                  height: imageSize.height * baseScale,
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                }}
              />
            )}

            {/* Guide overlay ring */}
            <div className="absolute inset-0 rounded-full border border-white/50 shadow-[0_0_0_1px_rgba(0,0,0,0.15)] pointer-events-none" />

            {/* 3x3 Alignment Grid Lines (Dual-layered for high contrast on all image types) */}
            {/* Dark background shadow lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none rounded-full overflow-hidden translate-x-[0.5px] translate-y-[0.5px]">
              <div className="border-r border-b border-black/30" />
              <div className="border-r border-b border-black/30" />
              <div className="border-b border-black/30" />

              <div className="border-r border-b border-black/30" />
              <div className="border-r border-b border-black/30" />
              <div className="border-b border-black/30" />

              <div className="border-r border-black/30" />
              <div className="border-r border-black/30" />
              <div className="border-none" />
            </div>
            {/* Light foreground lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none rounded-full overflow-hidden">
              <div className="border-r border-b border-white/50" />
              <div className="border-r border-b border-white/50" />
              <div className="border-b border-white/50" />

              <div className="border-r border-b border-white/50" />
              <div className="border-r border-b border-white/50" />
              <div className="border-b border-white/50" />

              <div className="border-r border-white/50" />
              <div className="border-r border-white/50" />
              <div className="border-none" />
            </div>
          </div>

          <p className="text-xs text-sd-on-surface-variant font-medium text-center font-sans">
            Drag the image to position, use the slider below to zoom.
          </p>

          {/* Zoom Control Area */}
          <div className="w-full space-y-2 px-2">
            <div className="flex justify-between items-center text-xs font-bold text-sd-on-surface-variant uppercase tracking-wider font-sans">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                className="w-8 h-8 rounded-full bg-sd-surface-container-low hover:bg-sd-surface-container border border-sd-surface-variant flex items-center justify-center text-sd-on-surface-variant hover:text-sd-primary transition-colors"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[18px]">zoom_out</span>
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={handleZoomChange}
                className="flex-1 h-1.5 bg-sd-surface-variant rounded-lg appearance-none cursor-pointer accent-sd-primary"
              />

              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                className="w-8 h-8 rounded-full bg-sd-surface-container-low hover:bg-sd-surface-container border border-sd-surface-variant flex items-center justify-center text-sd-on-surface-variant hover:text-sd-primary transition-colors"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[18px]">zoom_in</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-sd-surface-container-low border-t border-sd-surface-variant flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-sd-surface-variant hover:bg-sd-surface-container rounded-xl text-xs font-bold font-sans transition-all text-sd-on-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCrop}
            disabled={!imageLoaded}
            className={`px-5 py-2.5 bg-sd-primary text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all font-sans flex items-center gap-2 ${
              !imageLoaded ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">done</span>
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
}
