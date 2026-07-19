import React from 'react';
import { Instagram, MapPin, Phone } from 'lucide-react';
import { whatsappLink, WHATSAPP_NUMBER } from '../lib/supabaseClient';

export default function Footer() {
  const year = new Date().getFullYear();
  const phoneDisplay = `(${WHATSAPP_NUMBER.slice(2, 4)}) ${WHATSAPP_NUMBER.slice(4, 9)}-${WHATSAPP_NUMBER.slice(9)}`;

  return (
    <footer className="bg-brown-dark text-cream-alt pt-14 pb-8">
      <div className="container-page grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/images/logotipo.jpeg" alt="Pedaço do Céu" className="w-10 h-10 rounded-full object-cover" />
            <span className="font-script text-2xl">Pedaço do Céu</span>
          </div>
          <p className="text-sm text-cream/70 leading-relaxed max-w-xs">
            Tortas salgadas e pudins artesanais feitos com carinho, entregues em Jandira, Barueri e Itapevi.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-gold">Contato</h4>
          <ul className="space-y-2 text-sm text-cream/80">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-gold shrink-0" />
              <a href={whatsappLink('Olá! Vim pelo site do Pedaço do Céu 🍰')} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                {phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Instagram size={16} className="text-gold shrink-0" />
              <a href="https://instagram.com/pedacodoceudelicias" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                @pedacodoceudelicias
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-gold">Área de atendimento</h4>
          <ul className="space-y-2 text-sm text-cream/80">
            {['Jandira', 'Barueri', 'Itapevi'].map((c) => (
              <li key={c} className="flex items-center gap-2">
                <MapPin size={16} className="text-gold shrink-0" /> {c} e região
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-page border-t border-cream/10 mt-10 pt-6 text-xs text-cream/50 flex flex-col sm:flex-row justify-between gap-2">
        <span>© {year} Pedaço do Céu — Tortas &amp; Pudins. Todos os direitos reservados.</span>
        <a href="/admin" className="hover:text-gold transition-colors">Acesso administrativo</a>
      </div>
    </footer>
  );
}
