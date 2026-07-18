import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { whatsappLink } from '../lib/supabaseClient';

const LINKS = [
  { href: '#historia', label: 'Nossa História' },
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#atendimento', label: 'Atendimento' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#faq', label: 'Dúvidas' },
  { href: '#contato', label: 'Contato' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = (href) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-cream/95 backdrop-blur shadow-soft py-2' : 'bg-transparent py-4'
      }`}
    >
      <nav className="container-page flex items-center justify-between">
        <a href="#top" onClick={(e) => { e.preventDefault(); handleClick('#top'); }} className="flex items-center gap-2 shrink-0">
          <img src="/images/logotipo.jpeg" alt="Pedaço do Céu" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-soft" />
          <span className="font-script text-xl sm:text-2xl text-brown-dark">Pedaço do Céu</span>
        </a>

        <div className="hidden lg:flex items-center gap-6">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => handleClick(l.href)}
              className="text-sm font-medium text-brown hover:text-gold-dark transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={whatsappLink('Olá! Vim pelo site e gostaria de saber mais sobre os produtos 🍰')}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex btn-primary !py-2.5 !px-5 text-sm"
          >
            Pedir no WhatsApp
          </a>
          <button
            className="lg:hidden p-2 text-brown-dark"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden bg-cream/98 backdrop-blur border-t border-brown/10 mt-2">
          <div className="container-page py-4 flex flex-col gap-1">
            {LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => handleClick(l.href)}
                className="text-left py-2.5 text-brown-dark font-medium border-b border-brown/5 last:border-0"
              >
                {l.label}
              </button>
            ))}
            <a
              href={whatsappLink('Olá! Vim pelo site e gostaria de saber mais sobre os produtos 🍰')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-3 sm:hidden"
            >
              Pedir no WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
