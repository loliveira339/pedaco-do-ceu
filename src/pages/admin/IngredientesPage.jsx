import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCrud } from '../../hooks/useCrud';
import Modal from '../../components/admin/Modal';
import Field from '../../components/admin/Field';
import { formatBRL } from '../../utils/precificacao';

const EMPTY = { nome: '', unidade_medida: 'g', custo_unitario: '' };
const EMPTY_EMBALAGEM = { precoEmbalagem: '', pesoEmbalagem: '' };

export default function IngredientesPage() {
  const { items, loading, saving, create, update, remove } = useCrud('ingredientes', { orderBy: 'nome' });
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [modoCalculo, setModoCalculo] = useState('embalagem'); // 'embalagem' | 'manual'
  const [embalagem, setEmbalagem] = useState(EMPTY_EMBALAGEM);

  const custoCalculado =
    (Number(embalagem.precoEmbalagem) || 0) / (Number(embalagem.pesoEmbalagem) || 1);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setEmbalagem(EMPTY_EMBALAGEM);
    setModoCalculo('embalagem');
    setModal(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setForm(item);
    setEmbalagem(EMPTY_EMBALAGEM);
    setModoCalculo('manual');
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const custoFinal = modoCalculo === 'embalagem' ? custoCalculado : Number(form.custo_unitario) || 0;
    const payload = { ...form, custo_unitario: custoFinal };
    const { error } = editing ? await update(editing.id, payload) : await create(payload);
    if (!error) setModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remover este ingrediente?')) return;
    await remove(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-brown-dark">Ingredientes</h1>
          <p className="text-sm text-brown/60">Custo unitário usado na Calculadora de Precificação.</p>
        </div>
        <button onClick={openNew} className="btn-primary !bg-brown !py-2.5 !px-4 text-sm">
          <Plus size={18} /> Novo ingrediente
        </button>
      </div>

      <div className="card mt-6 divide-y divide-brown/10 overflow-hidden">
        {loading ? (
          <p className="p-5 text-brown/50 text-sm">Carregando…</p>
        ) : items.length === 0 ? (
          <p className="p-5 text-brown/50 text-sm">Nenhum ingrediente cadastrado ainda.</p>
        ) : (
          items.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div>
                <p className="font-medium text-brown-dark text-sm">{i.nome}</p>
                <p className="text-xs text-brown/50">{formatBRL(i.custo_unitario)} / {i.unidade_medida}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => openEdit(i)} className="p-2 text-brown/60 hover:text-brown-dark hover:bg-cream rounded-lg"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(i.id)} className="p-2 text-rose hover:text-red-600 hover:bg-rose/10 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar ingrediente' : 'Novo ingrediente'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
          <Field label="Unidade de medida" as="select" value={form.unidade_medida} onChange={(v) => setForm({ ...form, unidade_medida: v })}>
            <option value="g">g (gramas)</option>
            <option value="kg">kg (quilos)</option>
            <option value="ml">ml (mililitros)</option>
            <option value="l">l (litros)</option>
            <option value="un">un (unidade)</option>
          </Field>

          <div className="flex gap-2 p-1 bg-cream rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setModoCalculo('embalagem')}
              className={`flex-1 py-2 rounded-lg transition-colors ${modoCalculo === 'embalagem' ? 'bg-white text-brown-dark shadow-soft' : 'text-brown/50'}`}
            >
              Calcular pelo preço da embalagem
            </button>
            <button
              type="button"
              onClick={() => setModoCalculo('manual')}
              className={`flex-1 py-2 rounded-lg transition-colors ${modoCalculo === 'manual' ? 'bg-white text-brown-dark shadow-soft' : 'text-brown/50'}`}
            >
              Já sei o custo unitário
            </button>
          </div>

          {modoCalculo === 'embalagem' ? (
            <div className="space-y-3">
              <p className="text-xs text-brown/60 -mt-1">
                Informe quanto você pagou e o peso/volume total da embalagem que comprou. O sistema calcula
                sozinho o custo por {form.unidade_medida || 'unidade'}, sem arredondar.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Preço pago na embalagem (R$)"
                  type="number"
                  step="0.01"
                  value={embalagem.precoEmbalagem}
                  onChange={(v) => setEmbalagem({ ...embalagem, precoEmbalagem: v })}
                  required
                />
                <Field
                  label={`Peso/volume da embalagem (${form.unidade_medida || 'un'})`}
                  type="number"
                  step="0.01"
                  value={embalagem.pesoEmbalagem}
                  onChange={(v) => setEmbalagem({ ...embalagem, pesoEmbalagem: v })}
                  required
                />
              </div>
              <div className="bg-gold/10 border border-gold/30 rounded-xl px-3.5 py-2.5 text-sm">
                <span className="text-brown/60">Custo unitário calculado: </span>
                <span className="font-bold text-brown-dark">
                  {custoCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  {' '}/ {form.unidade_medida || 'un'}
                </span>
              </div>
            </div>
          ) : (
            <Field
              label="Custo unitário (R$ por unidade acima)"
              type="number"
              step="0.0001"
              value={form.custo_unitario}
              onChange={(v) => setForm({ ...form, custo_unitario: v })}
              required
            />
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full !bg-brown disabled:opacity-60">
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
