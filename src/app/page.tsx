'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { ConferenceTracks } from '@/components/ConferenceTracks';
import { ImportantDates } from '@/components/ImportantDates';
import { CallForPapers } from '@/components/CallForPapers';
import { Registration } from '@/components/Registration';
import { Publication } from '@/components/Publication';
import { Committee } from '@/components/Committee';
import { Venue } from '@/components/Venue';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { SubmitPaperModal } from '@/components/SubmitPaperModal';
import { RegisterModal } from '@/components/RegisterModal';
import { BrochureModal } from '@/components/BrochureModal';
import { SmoothScroll } from '@/components/SmoothScroll';

export default function HomePage() {
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [brochureModalOpen, setBrochureModalOpen] = useState(false);
  const [selectedTrackForSubmission, setSelectedTrackForSubmission] = useState('');

  const handleSelectTrackForSubmission = (trackName: string) => {
    setSelectedTrackForSubmission(trackName);
    setSubmitModalOpen(true);
  };

  const handleOpenSubmitModal = () => {
    setSelectedTrackForSubmission('');
    setSubmitModalOpen(true);
  };

  const handleExploreDetails = () => {
    const el = document.getElementById('about');
    if (el) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lenis = (window as any).__lenis;
      if (lenis) {
        lenis.scrollTo(el, { offset: -70, duration: 1.1 });
      } else {
        const topOffset = 70;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - topOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* Lenis Smooth Scrolling Engine */}
      <SmoothScroll />

      {/* Modern Clean Floating Navbar */}
      <Navbar
        onOpenSubmitModal={handleOpenSubmitModal}
        onOpenBrochureModal={() => setBrochureModalOpen(true)}
        onOpenRegisterModal={() => setRegisterModalOpen(true)}
      />

      <main className="flex-1 w-full">
        {/* Modern Hero with Background College Photo Carousel */}
        <Hero
          onOpenSubmitModal={handleOpenSubmitModal}
          onOpenBrochureModal={() => setBrochureModalOpen(true)}
          onExploreDetails={handleExploreDetails}
        />

        {/* About Section */}
        <About />

        {/* Conference Themes & Tracks */}
        <ConferenceTracks onSelectTrackForSubmission={handleSelectTrackForSubmission} />

        {/* Important Dates */}
        <ImportantDates />

        {/* Call for Papers */}
        <CallForPapers onOpenSubmitModal={handleOpenSubmitModal} />

        {/* Registration & Fee Structure */}
        <Registration 
          onOpenSubmitModal={handleOpenSubmitModal} 
          onOpenRegisterModal={() => setRegisterModalOpen(true)}
        />

        {/* Publication & Indexing */}
        <Publication />

        {/* Organizing Committee */}
        <Committee />

        {/* Venue & Location */}
        <Venue />

        {/* Contact Secretariat */}
        <Contact />
      </main>

      {/* Clean Modern Footer */}
      <Footer
        onOpenBrochureModal={() => setBrochureModalOpen(true)}
        onOpenSubmitModal={handleOpenSubmitModal}
        onOpenRegisterModal={() => setRegisterModalOpen(true)}
      />

      {/* Interactive Modals */}
      <SubmitPaperModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        preselectedTrack={selectedTrackForSubmission}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onOpenSubmitModal={handleOpenSubmitModal}
      />

      <BrochureModal
        isOpen={brochureModalOpen}
        onClose={() => setBrochureModalOpen(false)}
      />
    </div>
  );
}
