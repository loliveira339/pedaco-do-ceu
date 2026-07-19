import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import StickyMobileCTA from '../components/StickyMobileCTA';
import InstallPrompt from '../components/InstallPrompt';
import Hero from '../components/sections/Hero';
import NossaHistoria from '../components/sections/NossaHistoria';
import Cardapio from '../components/sections/Cardapio';
import Galeria from '../components/sections/Galeria';
import AreaAtendimento from '../components/sections/AreaAtendimento';
import Depoimentos from '../components/sections/Depoimentos';
import Faq from '../components/sections/Faq';
import Contato from '../components/sections/Contato';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <NossaHistoria />
        <Cardapio />
        <Galeria />
        <AreaAtendimento />
        <Depoimentos />
        <Faq />
        <Contato />
      </main>
      <Footer />
      <WhatsAppButton />
      <StickyMobileCTA />
      <InstallPrompt />
    </div>
  );
}
