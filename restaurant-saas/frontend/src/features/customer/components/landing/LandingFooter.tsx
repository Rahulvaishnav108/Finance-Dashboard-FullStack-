import React, { useState } from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Send, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const FOOTER_LINKS = {
  quickLinks: [
    { label: 'Home', href: '/' },
    { label: 'Restaurants', href: '/customer/restaurants' },
    { label: 'Reservations', href: '#reservations' },
    { label: 'Queue Status', href: '#queue' },
    { label: 'Offers', href: '/customer/offers' },
    { label: 'My Orders', href: '#orders' },
  ],
  support: [
    { label: 'Help Center', href: '#help' },
    { label: 'Contact Us', href: '#contact' },
    { label: 'FAQs', href: '#faq' },
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms & Conditions', href: '#terms' },
    { label: 'Refund Policy', href: '#refund' },
  ],
  forRestaurants: [
    { label: 'Partner With Us', href: '#partner' },
    { label: 'Restaurant Login', href: '/login' },
    { label: 'Business Solutions', href: '#solutions' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Resources', href: '#resources' },
  ],
};

const SOCIALS = [
  { Icon: Facebook, label: 'Facebook', href: '#' },
  { Icon: Instagram, label: 'Instagram', href: '#' },
  { Icon: Twitter, label: 'Twitter / X', href: '#' },
  { Icon: Linkedin, label: 'LinkedIn', href: '#' },
];

function FooterLink({ label, href }: { label: string; href: string }) {
  return (
    <li>
      <a
        href={href}
        className="landing-link-arrow flex items-center gap-2 text-[14px] py-1 transition-colors duration-150 group"
        style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#FF6B1A'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
      >
        <ArrowRight
          className="w-[13px] h-[13px] shrink-0 landing-arrow-rotate"
          style={{ color: 'inherit' }}
        />
        {label}
      </a>
    </li>
  );
}

export default function LandingFooter(): JSX.Element {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <footer
      id="contact"
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)' }}
    >
      {/* Bubble Background Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { left: '5%', bottom: '10%', size: 20, duration: 8 },
          { left: '15%', bottom: '5%', size: 14, duration: 10 },
          { left: '30%', bottom: '15%', size: 24, duration: 12 },
          { left: '45%', bottom: '8%', size: 10, duration: 9 },
          { left: '55%', bottom: '20%', size: 18, duration: 11 },
          { left: '70%', bottom: '12%', size: 22, duration: 7 },
          { left: '80%', bottom: '6%', size: 12, duration: 13 },
          { left: '90%', bottom: '18%', size: 16, duration: 10 },
          { left: '25%', bottom: '25%', size: 8, duration: 14 },
          { left: '65%', bottom: '3%', size: 26, duration: 9 },
        ].map((b, i) => (
          <div
            key={i}
            className="landing-bubble"
            style={{
              left: b.left,
              bottom: b.bottom,
              width: `${b.size}px`,
              height: `${b.size}px`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}
      </div>

      {/* Newsletter Strip */}
      <div
        className="py-10 sm:py-12"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-[22px] sm:text-[24px] font-bold text-white">
              Don't Miss Out on Great Offers!
            </h3>
            <p className="text-[14px] mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Subscribe to get the latest deals, restaurant updates & more.
            </p>
          </div>

          <div className="flex items-center gap-0 w-full sm:w-auto sm:min-w-[360px]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
              placeholder="Enter your email"
              className="flex-1 h-[48px] px-4 text-[14px] bg-transparent outline-none text-white placeholder:text-white/30"
              style={{
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '14px 0 0 14px',
                borderRight: 'none',
              }}
              aria-label="Email for newsletter"
            />
            <button
              onClick={handleSubscribe}
              className="h-[48px] px-5 text-[14px] font-semibold text-white flex items-center gap-2 transition-colors duration-150 landing-btn-premium shrink-0"
              style={{
                backgroundColor: subscribed ? '#4CAF50' : '#FF6B1A',
                borderRadius: '0 14px 14px 0',
              }}
              onMouseEnter={(e) => {
                if (!subscribed) e.currentTarget.style.backgroundColor = '#E65A0A';
              }}
              onMouseLeave={(e) => {
                if (!subscribed) e.currentTarget.style.backgroundColor = '#FF6B1A';
              }}
            >
              {subscribed ? 'Subscribed ✓' : (
                <>
                  <Send className="w-[15px] h-[15px]" />
                  Subscribe
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">

          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-[38px] h-[38px] rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FF6B1A' }}
              >
                <span className="material-symbols-outlined text-[18px] font-bold text-white block">restaurant</span>
              </div>
              <span className="font-bold text-[22px] tracking-tight text-white">
                Resto<span style={{ color: '#FF6B1A' }}>Hub</span>
              </span>
            </div>
            <p className="text-[14px] leading-relaxed max-w-[280px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              The next-generation restaurant discovery &amp; digital dining platform. From QR ordering to live table availability — all in one place.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              {SOCIALS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center transition-colors duration-150"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF6B1A';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  }}
                >
                  <Icon className="w-[16px] h-[16px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-white mb-5">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.quickLinks.map((link) => (
                <FooterLink key={link.label} label={link.label} href={link.href} />
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-white mb-5">
              Support
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.support.map((link) => (
                <FooterLink key={link.label} label={link.label} href={link.href} />
              ))}
            </ul>
          </div>

          {/* For Restaurants */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-white mb-5">
              For Restaurants
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.forRestaurants.map((link) => (
                <FooterLink key={link.label} label={link.label} href={link.href} />
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-white mb-5">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-[15px] h-[15px] mt-0.5 shrink-0" style={{ color: '#FF6B1A' }} />
                <span className="text-[14px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  hello@restohub.in
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-[15px] h-[15px] mt-0.5 shrink-0" style={{ color: '#FF6B1A' }} />
                <span className="text-[14px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  +91 98765 43210
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-[15px] h-[15px] mt-0.5 shrink-0" style={{ color: '#FF6B1A' }} />
                <span className="text-[14px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Bandra West, Mumbai, Maharashtra 400050
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            © 2025 RestoHub. All rights reserved.
          </span>
          <div className="flex items-center gap-5 text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <a
              href="#privacy"
              style={{ color: 'inherit', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FF6B1A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            >
              Privacy Policy
            </a>
            <span>|</span>
            <a
              href="#terms"
              style={{ color: 'inherit', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FF6B1A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            >
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
