import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { whatsappLink } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PedidoSucessoPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <div className="flex-1 container-page pt-32 pb-24 flex flex-col items-center text-center">
        <CheckCircle2 className="text-whatsapp mb-6" size={64} />
        <h1 className="section-title mb-4">Pedido recebido!</h1>
        <p className="text-brown/70 max-w-md mb-8">
          Assim que confirmarmos seu pagamento, vamos entrar em contato pelo WhatsApp com todos os
          detalhes da entrega.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href="/" className="btn-secondary">
            Voltar para o site
          </a>
          <a
            href={whatsappLink('Olá! Acabei de fazer um pedido pelo site e queria confirmar 🍰')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
