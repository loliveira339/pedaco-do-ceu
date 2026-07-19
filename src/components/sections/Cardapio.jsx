import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured, whatsappLink } from '../../lib/supabaseClient';
import { categoriasFallback, produtosFallback } from '../../data/seedFallback';
import { formatBRL } from '../../utils/precificacao';
import { useCarrinho } from '../../context/CarrinhoContext';
import Reveal from '../Reveal';

export default function Cardapio() {
  const [categorias, setCategorias] = useState(categoriasFallback);
  const [produtos, setProdutos] = useState(produtosFallback);
  const [ativa, setAtiva] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const { adicionar } = useCarrinho();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categorias').select('*').order('ordem'),
        supabase.from('produtos').select('*').eq('ativo', true).order('ordem'),
      ]);
      if (cats?.length) {
        setCategorias(cats);
        setAtiva(cats[0].id);
      }
      if (prods?.length) setProdutos(prods);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (categorias.length && !ativa) setAtiva(categorias[0].id);
  }, [categorias, ativa]);

  const produtosFiltrados = ativa ? produtos.filter((p) => p.categoria_id === ativa) : produtos;

  return (
    <section id="cardapio" className="py-16 sm:py-24">
      <div className="container-page">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <span className="section-eyebrow">Cardápio</span>
          <h2 className="section-title">Escolha o seu pedaço do céu</h2>
          <p className="mt-3 text-brown/70">Sabores que conquistam à primeira garfada.</p>
        </Reveal>

        <Reveal delay={0.05} className="flex justify-center gap-3 flex-wrap mb-10">
          {categorias.map((c) => (
            <button
              key={c.id}
              onClick={() => setAtiva(c.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                ativa === c.id
                  ? 'bg-brown text-cream shadow-soft scale-[1.03]'
                  : 'bg-white text-brown border border-brown/15 hover:border-brown/40'
              }`}
            >
              {c.nome}
            </button>
          ))}
        </Reveal>

        {loading ? (
          <p className="text-center text-brown/50">Carregando cardápio…</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtosFiltrados.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25 }} className="card overflow-hidden h-full flex flex-col">
                  <div className="h-52 overflow-hidden">
                    <img src={p.imagem_url} alt={p.nome} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-semibold text-lg text-brown-dark">{p.nome}</h3>
                      {p.destaque && (
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide bg-gold/20 text-gold-dark px-2 py-1 rounded-full">
                          Mais pedido
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-brown/70 leading-relaxed flex-1">{p.descricao}</p>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="font-display text-xl font-bold text-gold-dark">{formatBRL(p.preco)}</span>
                      <div className="flex items-center gap-3">
                        <a
                          href={whatsappLink(`Olá! Quero pedir: ${p.nome} 🍰`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-whatsapp hover:underline"
                        >
                          Pedir →
                        </a>
                        <button
                          onClick={() => {
                            adicionar(p);
                            toast.success(`${p.nome} adicionado ao carrinho`);
                          }}
                          aria-label={`Adicionar ${p.nome} ao carrinho`}
                          className="shrink-0 w-9 h-9 rounded-full bg-brown text-cream flex items-center justify-center hover:bg-brown-dark transition-colors"
                        >
                          <ShoppingCart size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
