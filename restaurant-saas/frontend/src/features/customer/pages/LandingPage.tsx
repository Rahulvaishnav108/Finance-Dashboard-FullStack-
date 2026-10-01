import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LandingNavbar,
  HeroSection,
  LiveAvailabilityStrip,
  CuisineExplorer,
  TrendingRestaurants,
  TrendingDishes,
  OffersDeals,
  DigitalDiningJourney,
  WhyChooseSection,
  BlogSection,
  TestimonialsSection,
  LandingFooter
} from '../components/landing';
import '../components/landing/landing.css';

export default function LandingPage() {
  const navigate = useNavigate();

  const openLogin = () => {
    navigate('/auth/customer');
  };

  return (
    <div className="landing-page-container min-h-screen bg-neutral-50 font-sans relative overflow-hidden">
      <LandingNavbar onLoginOpen={openLogin} />

      <HeroSection onLoginOpen={openLogin} />

      <LiveAvailabilityStrip />

      <div style={{ backgroundColor: '#FFFFFF' }}>
        <CuisineExplorer />
      </div>

      <div style={{ backgroundColor: '#FFFFFF' }}>
        <TrendingRestaurants onLoginOpen={openLogin} />
      </div>

      <TrendingDishes onLoginOpen={openLogin} />



      <OffersDeals />

      <div style={{ backgroundColor: '#FFFFFF' }}>
        <DigitalDiningJourney />
      </div>

      <WhyChooseSection />



      <div style={{ backgroundColor: '#FFFFFF' }}>
        <BlogSection />
      </div>

      <TestimonialsSection />

      <LandingFooter />

    </div>
  );
}
