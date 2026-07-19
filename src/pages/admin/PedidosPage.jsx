import React, { useState } from 'react';
import { MessageCircle, Package } from 'lucide-react';
import { useCrud } from '../../hooks/useCrud';
import Modal from '../../components/admin/Modal';
import Field from '../../components/admin/Field';
import { formatBRL } from '../../utils/precificacao';

// Link para o WhatsApp DO CLIENTE do pedido (diferente de whatsappLink() em
// lib/supabaseClient, que sempre aponta para o número da loja).
function whatsappClienteLink(telefone, mensagem) {
  const numero = String(telefone || '').replace(/\D/g, '');
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

const STATUS_LABELS = {
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago',
  preparando: 'Preparando',
  saiu_para_entrega: 'Saiu para entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

const STATUS_CORES = {
  aguardando_pagamento: 'bg-brown/10 text-brown/60',
  pago: 'bg-gold/20 text-gold-dark',
  preparando: 'bg-skyblue/30 text-brown-dark',
  saiu_para_entrega: 'bg-sweet/40 text-brown-dark',
  entregue: 'bg-whatsapp/15 text-whatsapp',
  cancelado: 'bg-rose/20 text-red-600',
};

const FILTROS = ['todos', ...Object.keys(STATUS_LABELS)];

export default function PedidosPage() {
  const { items: pedidos, loading, saving, update } = useCrud('pedidos', {
    orderBy: 'created_at',
    ascending: false,
    select: '*, pedido_itens(*)',
  });

  const [filtro, setFiltro] = useState('todos');
  const [selecionado, setSelecionado] = useState(null);
  const [form, setForm] = useState({ status: '', prazo_entrega: '', mensagem_admin: '' });

  const abrirDetalhe = (pedido) => {
    setSelecionado(pedido);
    setForm({
      status: pedido.status,
      prazo_entrega: pedido.prazo_entrega ? pedido.prazo_entrega.slice(0, 16) : '',
      mensagem_admin: pedido.mensagem_admin || '',
    });
  };

  const salvar = async () => {
    const payload = {
      status: form.status,
      prazo_entrega: form.prazo_entrega ? new Date(form.prazo_entrega).toISOString() : null,
      mensagem_admin: form.mensagem_admin || null,
    };
    const { error } = await update(selecionado.id, payload);
    if (!error) setSelecionado(null);
  };

  const mensagemWhatsapp = () => {
    if (!selecionado) return '';
    const partes = [
      `Olá, ${selecionado.cliente_nome}! Aqui é da Pedaço do Céu 🍰`,
      `Status do seu pedido: ${STATUS_LABELS[form.status] || form.status}.`,
    ];
    if (form.prazo_entrega) {
      partes.push(`Previsão de entrega: ${new Date(form.prazo_entrega).toLocaleString('pt-BR')}.`);
    }
    if (form.mensagem_admin) {
      partes.push(form.mensagem_admin);
    }
    return partes.join(' ');
  };

  const pedidosFiltrados = filtro === 'todos' ? pedidos : pedidos.filter((p) => p.status === filtro);

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-bold text-brown-dark">Pedidos</h1>
        <p className="text-sm text-brown/60">Encomendas feitas pelo site.</p>
      </div>

      <div className="flex gap-2 flex-wrap mt-5">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filtro === f ? 'bg-brown text-cream' : 'bg-white text-brown/70 border border-brown/15 hover:border-brown/40'
            }`}
          >
            {f === 'todos' ? 'Todos' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="card mt-5 divide-y divide-brown/10 overflow-hidden">
        {loading ? (
          <p className="p-5 text-brown/50 text-sm">Carregando…</p>
        ) : pedidosFiltrados.length === 0 ? (
          <p className="p-5 text-brown/50 text-sm">Nenhum pedido por aqui ainda.</p>
        ) : (
          pedidosFiltrados.map((p) => (
            <button
              key={p.id}
              onClick={() => abrirDetalhe(p)}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-cream/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-brown/5 flex items-center justify-center shrink-0">
                <Package size={18} className="text-brown/50" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-brown-dark text-sm truncate">{p.cliente_nome}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${STATUS_CORES[p.status]}`}>
                    {STATUS_LABELS[p.status] || p.status}
                  </span>
                </div>
                <p className="text-xs text-brown/50">
                  {new Date(p.created_at).toLocaleDateString('pt-BR')} · {p.pedido_itens?.length || 0} item(ns)
                </p>
              </div>
              <span className="font-display font-bold text-gold-dark shrink-0">{formatBRL(p.valor_total)}</span>
            </button>
          ))
        )}
      </div>

      <Modal open={!!selecionado} onClose={() => setSelecionado(null)} title="Detalhe do pedido">
        {selecionado && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-brown-dark uppercase tracking-wide mb-1">Cliente</p>
              <p className="text-sm text-brown-dark">{selecionado.cliente_nome}</p>
              <p className="text-sm text-brown/60">{selecionado.cliente_telefone}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-brown-dark uppercase tracking-wide mb-1">Endereço</p>
              <p className="text-sm text-brown-dark">
                {selecionado.endereco_rua}, {selecionado.endereco_numero}
                {selecionado.endereco_complemento ? ` — ${selecionado.endereco_complemento}` : ''}
              </p>
              <p className="text-sm text-brown/60">
                {selecionado.endereco_bairro}, {selecionado.endereco_cidade} - {selecionado.endereco_uf} · CEP{' '}
                {selecionado.endereco_cep}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-brown-dark uppercase tracking-wide mb-1">Itens</p>
              <div className="space-y-1">
                {selecionado.pedido_itens?.map((i) => (
                  <div key={i.id} className="flex justify-between text-sm">
                    <span className="text-brown-dark">
                      {i.quantidade}x {i.produto_nome}
                    </span>
                    <span className="text-brown/60">{formatBRL(i.preco_unitario * i.quantidade)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm mt-2 pt-2 border-t border-brown/10">
                <span className="text-brown/60">Frete ({selecionado.distancia_km} km)</span>
                <span className="text-brown/60">{formatBRL(selecionado.valor_frete)}</span>
              </div>
              <div className="flex justify-between font-semibold text-brown-dark mt-1">
                <span>Total</span>
                <span>{formatBRL(selecionado.valor_total)}</span>
              </div>
            </div>

            <Field label="Status" as="select" value={form.status} onChange={(v) => setForm({ ...form, status: v })}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Field>

            <Field
              label="Prazo de entrega"
              type="datetime-local"
              value={form.prazo_entrega}
              onChange={(v) => setForm({ ...form, prazo_entrega: v })}
            />

            <Field
              label="Mensagem para o cliente"
              as="textarea"
              value={form.mensagem_admin}
              onChange={(v) => setForm({ ...form, mensagem_admin: v })}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={salvar} disabled={saving} className="btn-primary w-full !bg-brown disabled:opacity-60">
                {saving ? 'Salvando…' : 'Salvar alterações'}
              </button>
              <a
                href={whatsappClienteLink(selecionado.cliente_telefone, mensagemWhatsapp())}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full !bg-whatsapp flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} /> Chamar no WhatsApp
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
