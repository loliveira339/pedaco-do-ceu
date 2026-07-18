import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Reveal from '../Reveal';

const PERGUNTAS = [
  {
    q: 'Com quanto tempo de antecedência preciso encomendar?',
    a: 'Recomendamos encomendar com pelo menos 2 dias de antecedência para garantir a data desejada, especialmente em finais de semana e datas comemorativas.',
  },
  {
    q: 'Quais formas de pagamento vocês aceitam?',
    a: 'Aceitamos Pix, cartão e dinheiro. Combine a forma de pagamento diretamente pelo WhatsApp ao fazer seu pedido.',
  },
  {
    q: 'Vocês entregam em qualquer bairro de Jandira, Barueri e Itapevi?',
    a: 'Atendemos toda a região dessas três cidades. Envie seu endereço pelo WhatsApp para confirmarmos a entrega e o valor do frete.',
  },
  {
    q: 'É possível fazer tortas ou pudins personalizados?',
    a: 'Sim! Fale com a gente pelo WhatsApp para combinar sabores, tamanhos e personalizações especiais para sua ocasião.',
  },
  {
    q: 'Como faço para retirar meu pedido em vez de receber entrega?',
    a: 'Sem problema — combine o horário e local de retirada diretamente pelo WhatsApp.',
  },
];

export default function Faq() {
  const [aberto, setAberto] = useState(0);

  return (
    <section id="faq" className="py-16 sm:py-24">
      <div className="container-page max-w-3xl">
        <Reveal className="text-center mb-10">
          <span className="section-eyebrow">Perguntas frequentes</span>
          <h2 className="section-title">Tirando suas dúvidas</h2>
        </Reveal>

        <div className="space-y-3">
          {PERGUNTAS.map((p, i) => {
            const isOpen = aberto === i;
            return (
              <Reveal key={p.q} delay={i * 0.05}>
                <div className="card overflow-hidden">
                  <button
                    onClick={() => setAberto(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-brown-dark text-sm sm:text-base">{p.q}</span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-gold-dark transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm text-brown/70 leading-relaxed">{p.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
