import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCrud } from '../../hooks/useCrud';
import Modal from '../../components/admin/Modal';
import Field from '../../components/admin/Field';

const EMPTY = { nome: '', slug: '', ordem: 0 };

export default function CategoriasPage() {
  const { items, loading, saving, create, update, remove } = useCrud('categorias', { orderBy: 'ordem' });
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (item) => { setEditing(item); setForm(item); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, ordem: Number(form.ordem) || 0 };
    const { error } = editing ? await update(editing.id, payload) : await create(payload);
    if (!error) setModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remover esta categoria? Produtos vinculados podem ficar sem categoria.')) return;
    await remove(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-brown-dark">Categorias</h1>
          <p className="text-sm text-brown/60">Organize o cardápio (ex: Tortas, Pudins).</p>
        </div>
        <button onClick={openNew} className="btn-primary !bg-brown !py-2.5 !px-4 text-sm">
          <Plus size={18} /> Nova categoria
        </button>
      </div>

      <div className="card mt-6 divide-y divide-brown/10 overflow-hidden">
        {loading ? (
          <p className="p-5 text-brown/50 text-sm">Carregando…</p>
        ) : items.length === 0 ? (
          <p className="p-5 text-brown/50 text-sm">Nenhuma categoria cadastrada ainda.</p>
        ) : (
          items.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div>
                <p className="font-medium text-brown-dark text-sm">{c.nome}</p>
                <p className="text-xs text-brown/50">/{c.slug} · ordem {c.ordem}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => openEdit(c)} className="p-2 text-brown/60 hover:text-brown-dark hover:bg-cream rounded-lg"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-2 text-rose hover:text-red-600 hover:bg-rose/10 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar categoria' : 'Nova categoria'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
          <Field label="Slug (identificador único)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required />
          <Field label="Ordem de exibição" type="number" value={form.ordem} onChange={(v) => setForm({ ...form, ordem: v })} />
          <button type="submit" disabled={saving} className="btn-primary w-full !bg-brown disabled:opacity-60">
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
