import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, MessageCircle, Phone } from 'lucide-react';
import { whatsappLink, WHATSAPP_NUMBER } from '../../lib/supabaseClient';
import Reveal from '../Reveal';

export default function Contato() {
  const phoneDisplay = `(${WHATSAPP_NUMBER.slice(2, 4)}) ${WHATSAPP_NUMBER.slice(4, 9)}-${WHATSAPP_NUMBER.slice(9)}`;

  return (
    <section id="contato" className="py-16 sm:py-24 bg-gradient-to-br from-brown-dark to-brown text-cream overflow-hidden relative">
      <div aria-hidden className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="container-page relative text-center max-w-xl mx-auto">
        <Reveal>
          <span className="inline-block text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-gold mb-3">
            Contato
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold" style={{ overflowWrap: 'anywhere' }}>
            Bora combinar o seu pedido?
          </h2>
          <p className="mt-4 text-cream/75">
            Chame a gente no WhatsApp — respondemos rapidinho e ajudamos a escolher o sabor perfeito.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <motion.a
            whileTap={{ scale: 0.97 }}
            href={whatsappLink('Olá! Vim pelo site e gostaria de fazer um pedido 🍰')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-7 !px-8 !py-4 text-base"
          >
            <MessageCircle size={20} /> Chamar no WhatsApp
          </motion.a>
        </Reveal>

        <Reveal delay={0.18} className="mt-8 flex items-center justify-center gap-6 text-sm text-cream/80">
          <a href={whatsappLink('Olá!')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold transition-colors">
            <Phone size={16} /> {phoneDisplay}
          </a>
          <a href="https://instagram.com/pedacodoceudelicias" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold transition-colors">
            <Instagram size={16} /> @pedacodoceudelicias
          </a>
        </Reveal>
      </div>
    </section>
  );
}
