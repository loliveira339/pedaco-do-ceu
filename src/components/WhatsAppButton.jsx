import React from 'react';
import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '../lib/supabaseClient';

export default function WhatsAppButton({ message = 'Olá! Vim pelo site e gostaria de fazer um pedido 🍰' }) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed z-40 bottom-5 right-5 sm:bottom-7 sm:right-7 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-whatsapp text-white shadow-soft flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <MessageCircle size={28} strokeWidth={2} />
    </a>
  );
}
