import React from 'react';
import { MapPin, Truck, Clock } from 'lucide-react';
import Reveal from '../Reveal';

const CIDADES = [
  { nome: 'Jandira', desc: 'Entrega em toda a cidade' },
  { nome: 'Barueri', desc: 'Entrega em toda a cidade' },
  { nome: 'Itapevi', desc: 'Entrega em toda a cidade' },
];

export default function AreaAtendimento() {
  return (
    <section id="atendimento" className="py-16 sm:py-24">
      <div className="container-page">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <span className="section-eyebrow">Área de atendimento</span>
          <h2 className="section-title">Entregamos o seu pedaço do céu até você</h2>
        </Reveal>

        <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {CIDADES.map((c, i) => (
            <Reveal key={c.nome} delay={i * 0.08}>
              <div className="card p-6 text-center h-full">
                <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="text-gold-dark" size={22} />
                </div>
                <h3 className="font-display font-semibold text-lg text-brown-dark">{c.nome}</h3>
                <p className="text-sm text-brown/70 mt-1">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-brown/70">
          <div className="flex items-center gap-2"><Truck size={18} className="text-gold-dark" /> Combine a entrega direto pelo WhatsApp</div>
          <div className="flex items-center gap-2"><Clock size={18} className="text-gold-dark" /> Encomendas com antecedência garantem seu pedido</div>
        </Reveal>
      </div>
    </section>
  );
}
