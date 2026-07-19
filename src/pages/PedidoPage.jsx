import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCarrinho } from '../context/CarrinhoContext';
import { formatBRL } from '../utils/precificacao';
import Field from '../components/admin/Field';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ENDERECO_VAZIO = {
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
};

export default function PedidoPage() {
  const { itens, alterarQuantidade, remover, subtotal, limpar } = useCarrinho();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState({ nome: '', telefone: '', email: '', observacoes: '' });
  const [endereco, setEndereco] = useState(ENDERECO_VAZIO);
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [frete, setFrete] = useState(null);
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  const buscarCep = async (cepDigitado) => {
    const cepLimpo = cepDigitado.replace(/\D/g, '');
    setEndereco((e) => ({ ...e, cep: cepDigitado }));
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await resp.json();
      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }
      setEndereco((e) => ({
        ...e,
        rua: data.logradouro || e.rua,
        bairro: data.bairro || e.bairro,
        cidade: data.localidade || e.cidade,
        uf: data.uf || e.uf,
      }));
      setFrete(null);
    } catch {
      toast.error('Não foi possível buscar o CEP agora');
    } finally {
      setBuscandoCep(false);
    }
  };

  const calcularFrete = async () => {
    if (!endereco.rua || !endereco.numero || !endereco.bairro || !endereco.cidade || !endereco.uf) {
      toast.error('Preencha o endereço completo antes de calcular o frete');
      return;
    }
    setCalculandoFrete(true);
    setFrete(null);
    try {
      const resp = await fetch('/api/calcular-frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(endereco),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data.error || 'Não foi possível calcular o frete');
        return;
      }
      setFrete(data);
    } catch {
      toast.error('Não foi possível calcular o frete agora');
    } finally {
      setCalculandoFrete(false);
    }
  };

  const total = subtotal + (frete?.valor_frete || 0);

  const finalizarPedido = async () => {
    if (!cliente.nome || !cliente.telefone) {
      toast.error('Preencha seu nome e telefone');
      return;
    }
    if (!frete) {
      toast.error('Calcule o frete antes de finalizar');
      return;
    }
    setFinalizando(true);
    try {
      const resp = await fetch('/api/criar-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente,
          endereco,
          itens: itens.map((i) => ({ produto_id: i.produto_id, quantidade: i.quantidade })),
          forma_pagamento: formaPagamento,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data.error || 'Não foi possível criar o pedido');
        return;
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      // Ainda sem checkout PagBank integrado (Fase 3) — confirma localmente.
      toast.success('Pedido criado! Em breve entraremos em contato.');
      limpar();
      navigate('/pedido/sucesso');
    } catch {
      toast.error('Não foi possível finalizar o pedido agora');
    } finally {
      setFinalizando(false);
    }
  };

  if (itens.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <Navbar />
        <div className="flex-1 container-page py-32 text-center">
          <h1 className="section-title mb-4">Seu carrinho está vazio</h1>
          <p className="text-brown/70 mb-8">Adicione produtos do cardápio para fazer sua encomenda.</p>
          <a href="/#cardapio" className="btn-primary inline-flex">
            Ver cardápio
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />

      <div className="flex-1 container-page pt-28 pb-16 sm:pt-36 sm:pb-24">
        <a href="/#cardapio" className="inline-flex items-center gap-2 text-sm text-brown/70 hover:text-brown-dark mb-6">
          <ArrowLeft size={16} /> Continuar comprando
        </a>

        <h1 className="section-title mb-8">Finalizar encomenda</h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          <div className="space-y-8">
            {/* Carrinho */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
              <h2 className="font-display font-semibold text-lg text-brown-dark mb-4">Seu pedido</h2>
              <div className="divide-y divide-brown/10">
                {itens.map((item) => (
                  <div key={item.produto_id} className="py-3 flex items-center gap-3">
                    <img
                      src={item.imagem_url}
                      alt={item.nome}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brown-dark truncate">{item.nome}</p>
                      <p className="text-sm text-brown/60">{formatBRL(item.preco)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alterarQuantidade(item.produto_id, item.quantidade - 1)}
                        className="w-7 h-7 rounded-full border border-brown/20 flex items-center justify-center hover:bg-brown/5"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantidade}</span>
                      <button
                        onClick={() => alterarQuantidade(item.produto_id, item.quantidade + 1)}
                        className="w-7 h-7 rounded-full border border-brown/20 flex items-center justify-center hover:bg-brown/5"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => remover(item.produto_id)}
                      aria-label={`Remover ${item.nome}`}
                      className="text-brown/40 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Dados do cliente */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-5">
              <h2 className="font-display font-semibold text-lg text-brown-dark mb-4">Seus dados</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nome completo" required value={cliente.nome} onChange={(v) => setCliente((c) => ({ ...c, nome: v }))} />
                <Field label="WhatsApp" required value={cliente.telefone} onChange={(v) => setCliente((c) => ({ ...c, telefone: v }))} />
                <Field label="E-mail (opcional)" type="email" value={cliente.email} onChange={(v) => setCliente((c) => ({ ...c, email: v }))} />
              </div>
            </motion.div>

            {/* Endereço */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
              <h2 className="font-display font-semibold text-lg text-brown-dark mb-4">Endereço de entrega</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label={buscandoCep ? 'CEP (buscando…)' : 'CEP'}
                  required
                  value={endereco.cep}
                  onChange={buscarCep}
                />
                <Field label="Número" required value={endereco.numero} onChange={(v) => { setEndereco((e) => ({ ...e, numero: v })); setFrete(null); }} />
                <div className="sm:col-span-2">
                  <Field label="Rua" required value={endereco.rua} onChange={(v) => { setEndereco((e) => ({ ...e, rua: v })); setFrete(null); }} />
                </div>
                <Field label="Bairro" required value={endereco.bairro} onChange={(v) => { setEndereco((e) => ({ ...e, bairro: v })); setFrete(null); }} />
                <Field label="Complemento" value={endereco.complemento} onChange={(v) => setEndereco((e) => ({ ...e, complemento: v }))} />
                <Field label="Cidade" required value={endereco.cidade} onChange={(v) => { setEndereco((e) => ({ ...e, cidade: v })); setFrete(null); }} />
                <Field label="UF" required value={endereco.uf} onChange={(v) => { setEndereco((e) => ({ ...e, uf: v })); setFrete(null); }} />
              </div>

              <button
                onClick={calcularFrete}
                disabled={calculandoFrete}
                className="btn-secondary mt-4 w-full sm:w-auto disabled:opacity-50"
              >
                {calculandoFrete ? 'Calculando frete…' : 'Calcular frete'}
              </button>

              {frete && (
                <p className="mt-3 text-sm text-brown/70">
                  Distância: <strong className="text-brown-dark">{frete.distancia_km} km</strong> · Entrega de moto:{' '}
                  <strong className="text-gold-dark">{formatBRL(frete.valor_frete)}</strong>
                </p>
              )}
            </motion.div>

            {/* Pagamento */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5">
              <h2 className="font-display font-semibold text-lg text-brown-dark mb-4">Forma de pagamento</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'pix', label: 'PIX' },
                  { id: 'cartao', label: 'Cartão' },
                  { id: 'boleto', label: 'Boleto' },
                ].map((opcao) => (
                  <button
                    key={opcao.id}
                    onClick={() => setFormaPagamento(opcao.id)}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                      formaPagamento === opcao.id
                        ? 'bg-brown text-cream border-brown'
                        : 'bg-white text-brown border-brown/15 hover:border-brown/40'
                    }`}
                  >
                    {opcao.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Resumo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-5 h-fit sticky top-28"
          >
            <h2 className="font-display font-semibold text-lg text-brown-dark mb-4">Resumo</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-brown/70">
                <span>Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brown/70">
                <span>Frete</span>
                <span>{frete ? formatBRL(frete.valor_frete) : '—'}</span>
              </div>
              <div className="flex justify-between font-display text-lg font-bold text-brown-dark pt-2 border-t border-brown/10">
                <span>Total</span>
                <span>{formatBRL(total)}</span>
              </div>
            </div>

            <button
              onClick={finalizarPedido}
              disabled={finalizando || !frete}
              className="btn-primary w-full mt-6 disabled:opacity-50"
            >
              {finalizando ? 'Finalizando…' : 'Finalizar pedido'}
            </button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
