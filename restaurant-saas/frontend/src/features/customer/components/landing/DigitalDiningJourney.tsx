import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Calendar, MapPin, QrCode, UtensilsCrossed,
  Eye, Bell, CreditCard, MessageSquare
} from 'lucide-react';

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { icon: Search, title: 'Discover', description: 'Browse and find your perfect restaurant' },
  { icon: Calendar, title: 'Reserve', description: 'Book a table with instant confirmation' },
  { icon: MapPin, title: 'Arrive', description: 'Walk in and get seated seamlessly' },
  { icon: QrCode, title: 'Scan QR', description: 'Scan the table QR to start your session' },
  { icon: UtensilsCrossed, title: 'Order', description: 'Explore the digital menu and order' },
  { icon: Eye, title: 'Track', description: 'Watch your order being prepared live' },
  { icon: Bell, title: 'Service', description: 'Request anything from your table' },
  { icon: CreditCard, title: 'Pay', description: 'Pay securely with multiple options' },
  { icon: MessageSquare, title: 'Feedback', description: 'Share your experience & earn rewards' },
];

const LEFT_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop';
const RIGHT_IMAGE = 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=500&auto=format&fit=crop';

export default function DigitalDiningJourney() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Auto-advance active step */
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section className="py-12 sm:py-16 overflow-hidden relative" ref={ref}>
      {/* ── Left Visible Image ── */}
      <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-[220px] xl:w-[280px]">
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: '0 24px 24px 0',
            boxShadow: '8px 0 30px rgba(0,0,0,0.08)',
          }}
        >
          <img
            src={LEFT_IMAGE}
            alt="Delicious food presentation"
            className="w-full h-[340px] xl:h-[400px] object-cover"
            loading="lazy"
          />
          {/* Faint fade-out overlay on the inner edge */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to left, rgba(255,255,255,0.7) 0%, transparent 50%)',
            }}
          />
          {/* Faint branding watermark */}
          <div
            className="absolute bottom-4 left-4 text-[11px] font-bold tracking-wider uppercase"
            style={{ color: 'rgba(255,107,26,0.5)' }}
          >
            RestoHub
          </div>
        </div>
      </div>

      {/* ── Right Visible Image ── */}
      <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[220px] xl:w-[280px]">
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: '24px 0 0 24px',
            boxShadow: '-8px 0 30px rgba(0,0,0,0.08)',
          }}
        >
          <img
            src={RIGHT_IMAGE}
            alt="Beautiful restaurant ambiance"
            className="w-full h-[340px] xl:h-[400px] object-cover"
            loading="lazy"
          />
          {/* Faint fade-out overlay on the inner edge */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, rgba(255,255,255,0.7) 0%, transparent 50%)',
            }}
          />
          {/* Faint branding watermark */}
          <div
            className="absolute bottom-4 right-4 text-[11px] font-bold tracking-wider uppercase"
            style={{ color: 'rgba(255,107,26,0.5)' }}
          >
            RestoHub
          </div>
        </div>
      </div>

      {/* Center Glow Orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none landing-glow-orb"
        style={{
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,26,0.05) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-[900px] mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-[28px] sm:text-[32px] lg:text-[40px] font-bold"
            style={{ color: '#222222' }}
          >
            The Digital Dining <span style={{ color: '#FF6B1A' }}>Experience</span>
          </h2>
          <p className="text-[15px] mt-2 max-w-[480px] mx-auto" style={{ color: '#666666' }}>
            From discovery to feedback — one seamless journey
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block">
          {/* Progress Line */}
          <div className="relative mx-auto" style={{ maxWidth: '800px' }}>
            {/* Background Line */}
            <div
              className="absolute top-[24px] left-[40px] right-[40px] h-[3px]"
              style={{ backgroundColor: '#E5E7EB', borderRadius: '2px' }}
            />
            {/* Active Progress Line */}
            <div
              className="absolute top-[24px] left-[40px] h-[3px] landing-timeline-line"
              style={{
                backgroundColor: '#FF6B1A',
                borderRadius: '2px',
                width: `${(activeStep / (STEPS.length - 1)) * (100 - 10)}%`,
              }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === activeStep;
                const isPast = idx <= activeStep;
                return (
                  <button
                    key={step.title}
                    onClick={() => setActiveStep(idx)}
                    className={`flex flex-col items-center text-center w-[80px] pt-0 transition-all duration-500 landing-focus-ring ${
                      isVisible ? 'landing-fade-in is-visible' : 'landing-fade-in'
                    }`}
                    style={{ transitionDelay: `${idx * 80}ms` }}
                  >
                    {/* Circle */}
                    <div
                      className="w-[48px] h-[48px] rounded-full flex items-center justify-center transition-all duration-300 relative z-10"
                      style={{
                        backgroundColor: isPast ? '#FF6B1A' : '#FFFFFF',
                        border: `2px solid ${isPast ? '#FF6B1A' : '#E5E7EB'}`,
                        transform: isActive ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: isActive ? '0 4px 12px rgba(255,107,26,0.3)' : 'none',
                      }}
                    >
                      <Icon
                        className="w-[20px] h-[20px]"
                        style={{ color: isPast ? '#FFFFFF' : '#666666' }}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className="text-[12px] font-semibold mt-3 transition-colors duration-300"
                      style={{ color: isPast ? '#FF6B1A' : '#222222' }}
                    >
                      {step.title}
                    </span>
                    <span
                      className="text-[10px] mt-0.5 leading-snug transition-colors duration-300"
                      style={{ color: isActive ? '#222222' : '#666666' }}
                    >
                      {step.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Timeline (Vertical) */}
        <div className="lg:hidden">
          <div className="relative pl-8">
            {/* Vertical Line */}
            <div
              className="absolute left-[15px] top-0 bottom-0 w-[2px]"
              style={{ backgroundColor: '#E5E7EB' }}
            />
            {/* Active Portion */}
            <div
              className="absolute left-[15px] top-0 w-[2px] transition-all duration-500"
              style={{
                backgroundColor: '#FF6B1A',
                height: `${((activeStep + 1) / STEPS.length) * 100}%`,
              }}
            />

            <div className="space-y-6">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === activeStep;
                const isPast = idx <= activeStep;
                return (
                  <button
                    key={step.title}
                    onClick={() => setActiveStep(idx)}
                    className={`flex items-start gap-4 w-full text-left relative transition-all duration-500 ${
                      isVisible ? 'landing-fade-in is-visible' : 'landing-fade-in'
                    }`}
                    style={{ transitionDelay: `${idx * 60}ms` }}
                  >
                    {/* Circle */}
                    <div
                      className="w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 absolute -left-8 transition-all duration-300 z-10"
                      style={{
                        backgroundColor: isPast ? '#FF6B1A' : '#FFFFFF',
                        border: `2px solid ${isPast ? '#FF6B1A' : '#E5E7EB'}`,
                        transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      <Icon
                        className="w-[14px] h-[14px]"
                        style={{ color: isPast ? '#FFFFFF' : '#666666' }}
                      />
                    </div>

                    {/* Content */}
                    <div className="ml-2 pb-2">
                      <span
                        className="text-[15px] font-semibold block transition-colors duration-300"
                        style={{ color: isPast ? '#FF6B1A' : '#222222' }}
                      >
                        {step.title}
                      </span>
                      <span className="text-[13px] mt-0.5 block" style={{ color: '#666666' }}>
                        {step.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
