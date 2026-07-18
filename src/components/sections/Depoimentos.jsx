import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { depoimentosFallback } from '../../data/seedFallback';
import Reveal from '../Reveal';

export default function Depoimentos() {
  const [depoimentos, setDepoimentos] = useState(depoimentosFallback);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.from('depoimentos').select('*').eq('aprovado', true).order('created_at', { ascending: false }).then(({ data }) => {
      if (data?.length) setDepoimentos(data);
    });
  }, []);

  return (
    <section id="depoimentos" className="py-16 sm:py-24 bg-white/50">
      <div className="container-page">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <span className="section-eyebrow">Depoimentos</span>
          <h2 className="section-title">Quem prova, vira cliente fiel</h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {depoimentos.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.08}>
              <div className="card p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} size={16} className={idx < d.nota ? 'fill-gold text-gold' : 'text-brown/15'} />
                  ))}
                </div>
                <p className="text-sm text-brown/80 leading-relaxed flex-1">"{d.texto}"</p>
                <p className="mt-4 font-semibold text-brown-dark text-sm">{d.nome_cliente}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
