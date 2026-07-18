import React from 'react';
import Reveal from '../Reveal';

export default function NossaHistoria() {
  return (
    <section id="historia" className="py-16 sm:py-24 bg-white/50">
      <div className="container-page grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <Reveal>
          <div className="relative order-2 lg:order-1">
            <div className="rounded-[2rem] overflow-hidden shadow-card border-4 border-cream-alt aspect-[4/5] w-full max-w-[400px] mx-auto lg:mx-0 lg:max-w-full">
              <img
                src="/images/milena-cozinhando.jpg"
                alt="Milena sorrindo enquanto prepara o Pudim Perfeito, finalizando com a calda"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 sm:-right-8 bg-white rounded-2xl shadow-soft px-4 py-3 max-w-[210px]">
              <p className="font-script text-2xl text-gold-dark leading-none">Milena</p>
              <p className="text-xs text-brown/70 mt-1">Confeiteira e fundadora</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="order-1 lg:order-2">
          <span className="section-eyebrow">Nossa história</span>
          <h2 className="section-title">Uma receita de família que virou o sabor da sua semana</h2>
          <p className="mt-5 text-brown/80 leading-relaxed">
            O Pedaço do Céu nasceu das mãos da Milena, do carinho de preparar tortas e pudins para
            quem ela ama — e virou o sabor que muitas famílias em Jandira, Barueri e Itapevi já não
            abrem mão. Cada receita é feita à mão por ela, com ingredientes selecionados e o mesmo
            cuidado de sempre, para que cada pedaço chegue até você com aquele gostinho de casa.
          </p>
          <p className="mt-4 text-brown/80 leading-relaxed">
            Hoje, a Milena segue com o mesmo propósito: levar momentos doces (e salgados!) para a
            sua mesa, em cada encomenda, em cada detalhe.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
