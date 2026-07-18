import React from 'react';
import { motion } from 'framer-motion';
import { whatsappLink } from '../../lib/supabaseClient';

export default function Hero() {
  return (
    <section id="top" className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-gradient-to-b from-cream-alt via-cream to-cream">
      {/* Formas decorativas suaves, não IA-genéricas: usam a paleta da marca */}
      <div aria-hidden className="absolute -top-16 -right-24 w-72 h-72 rounded-full bg-gold/20 blur-3xl" />
      <div aria-hidden className="absolute top-40 -left-24 w-72 h-72 rounded-full bg-skyblue/25 blur-3xl" />

      <div className="container-page relative grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="section-eyebrow">Feito à mão, todos os dias</span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.08] text-brown-dark font-bold overflow-wrap-anywhere" style={{ overflowWrap: 'anywhere' }}>
            Um <span className="font-script text-gold-dark font-normal text-5xl sm:text-6xl md:text-7xl">pedaço</span> do céu em cada mordida
          </h1>
          <p className="mt-5 text-brown/80 text-base sm:text-lg leading-relaxed max-w-lg">
            Tortas salgadas e pudins artesanais, preparados com ingredientes selecionados e muito
            carinho — entregues fresquinhos em Jandira, Barueri e Itapevi.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <motion.a
              whileTap={{ scale: 0.97 }}
              href={whatsappLink('Olá! Vim pelo site e gostaria de fazer um pedido 🍰')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Peça agora pelo WhatsApp
            </motion.a>
            <a href="#cardapio" className="btn-secondary" onClick={(e) => { e.preventDefault(); document.querySelector('#cardapio')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Ver cardápio
            </a>
          </div>

          <div className="mt-8 flex items-center gap-6 text-sm text-brown/70">
            <div><strong className="text-brown-dark text-lg block">100%</strong>artesanal</div>
            <div className="w-px h-8 bg-brown/15" />
            <div><strong className="text-brown-dark text-lg block">3</strong>cidades atendidas</div>
            <div className="w-px h-8 bg-brown/15" />
            <div><strong className="text-brown-dark text-lg block">5★</strong>reputação</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="rounded-[2rem] overflow-hidden shadow-card border-4 border-white">
            <img
              src="/images/banner-hero.jpg"
              alt="Torta salgada e pudim artesanais Pedaço do Céu"
              className="w-full h-[320px] sm:h-[420px] object-cover"
              loading="eager"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 sm:-left-8 bg-white rounded-2xl shadow-soft px-4 py-3 flex items-center gap-2 max-w-[220px]">
            <span className="text-2xl">🍮</span>
            <span className="text-xs sm:text-sm text-brown-dark font-medium leading-snug">Pudim que desmancha na boca</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
