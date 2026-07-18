import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { galeriaFallback } from '../../data/seedFallback';
import Reveal from '../Reveal';

export default function Galeria() {
  const [fotos, setFotos] = useState(galeriaFallback);
  const [aberta, setAberta] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.from('galeria').select('*').order('ordem').then(({ data }) => {
      if (data?.length) setFotos(data);
    });
  }, []);

  return (
    <section id="galeria" className="py-16 sm:py-24 bg-white/50">
      <div className="container-page">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <span className="section-eyebrow">Galeria</span>
          <h2 className="section-title">Cada foto, uma delícia</h2>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {fotos.map((f, i) => (
            <Reveal key={f.id} delay={i * 0.05}>
              <button
                onClick={() => setAberta(f)}
                className="block w-full aspect-square rounded-xl overflow-hidden shadow-soft group"
              >
                <img
                  src={f.imagem_url}
                  alt={f.legenda || 'Pedaço do Céu'}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {aberta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-brown-dark/90 flex items-center justify-center p-4 sm:p-8"
            onClick={() => setAberta(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={aberta.imagem_url}
              alt={aberta.legenda || ''}
              className="max-w-full max-h-full rounded-2xl shadow-card"
            />
            <button
              aria-label="Fechar"
              onClick={() => setAberta(null)}
              className="absolute top-5 right-5 sm:top-8 sm:right-8 text-cream bg-white/10 rounded-full p-2 hover:bg-white/20"
            >
              <X size={22} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
