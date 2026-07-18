import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Upload, Star, Calculator } from 'lucide-react';
import { useCrud } from '../../hooks/useCrud';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import Modal from '../../components/admin/Modal';
import Field from '../../components/admin/Field';
import { formatBRL } from '../../utils/precificacao';

const EMPTY = { nome: '', descricao: '', preco: '', categoria_id: '', imagem_url: '', ativo: true, destaque: false };

export default function ProdutosPage() {
  const { items: produtos, loading, saving, create, update, remove } = useCrud('produtos', { orderBy: 'ordem' });
  const { items: categorias } = useCrud('categorias', { orderBy: 'ordem' });
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const openNew = () => { setEditing(null); setForm(EMPTY); setFile(null); setModal(true); };
  const openEdit = (item) => { setEditing(item); setForm(item); setFile(null); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imagem_url = form.imagem_url;

    if (file) {
      if (!isSupabaseConfigured) {
        toast.error('Configure o Supabase (.env) para enviar fotos reais.');
        return;
      }
      setUploading(true);
      const path = `produtos/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { error: uploadError } = await supabase.storage.from('fotos').upload(path, file);
      setUploading(false);
      if (uploadError) {
        toast.error(uploadError.message);
        return;
      }
      const { data: pub } = supabase.storage.from('fotos').getPublicUrl(path);
      imagem_url = pub.publicUrl;
    }

    const payload = {
      nome: form.nome,
      descricao: form.descricao,
      preco: Number(form.preco) || 0,
      categoria_id: form.categoria_id || null,
      imagem_url,
      ativo: !!form.ativo,
      destaque: !!form.destaque,
    };

    const { error } = editing ? await update(editing.id, payload) : await create(payload);
    if (!error) setModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remover este produto do cardápio?')) return;
    await remove(id);
  };

  const nomeCategoria = (id) => categorias.find((c) => c.id === id)?.nome || '—';

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-brown-dark">Produtos</h1>
          <p className="text-sm text-brown/60">Itens exibidos no cardápio do site.</p>
        </div>
        <button onClick={openNew} className="btn-primary !bg-brown !py-2.5 !px-4 text-sm">
          <Plus size={18} /> Novo produto
        </button>
      </div>

      <div className="card mt-6 divide-y divide-brown/10 overflow-hidden">
        {loading ? (
          <p className="p-5 text-brown/50 text-sm">Carregando…</p>
        ) : produtos.length === 0 ? (
          <p className="p-5 text-brown/50 text-sm">Nenhum produto cadastrado ainda.</p>
        ) : (
          produtos.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
              {p.imagem_url && <img src={p.imagem_url} alt={p.nome} className="w-12 h-12 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-brown-dark text-sm truncate">{p.nome}</p>
                  {p.destaque && <Star size={13} className="fill-gold text-gold shrink-0" />}
                  {!p.ativo && <span className="text-[10px] bg-brown/10 text-brown/50 px-1.5 py-0.5 rounded shrink-0">inativo</span>}
                </div>
                <p className="text-xs text-brown/50">{nomeCategoria(p.categoria_id)} · {formatBRL(p.preco)}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link to={`/admin/calculadora?produto=${p.id}`} className="p-2 text-brown/60 hover:text-brown-dark hover:bg-cream rounded-lg" title="Precificar"><Calculator size={16} /></Link>
                <button onClick={() => openEdit(p)} className="p-2 text-brown/60 hover:text-brown-dark hover:bg-cream rounded-lg"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-rose hover:text-red-600 hover:bg-rose/10 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar produto' : 'Novo produto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
          <Field label="Descrição" as="textarea" value={form.descricao} onChange={(v) => setForm({ ...form, descricao: v })} />
          <Field label="Preço (R$)" type="number" step="0.01" value={form.preco} onChange={(v) => setForm({ ...form, preco: v })} required />
          <Field label="Categoria" as="select" value={form.categoria_id} onChange={(v) => setForm({ ...form, categoria_id: v })} required>
            <option value="">Selecione…</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Field>

          <div>
            <label className="text-xs font-semibold text-brown-dark uppercase tracking-wide">Foto do produto</label>
            <label className="mt-1.5 flex items-center justify-center gap-2 border-2 border-dashed border-brown/20 rounded-xl px-4 py-5 text-sm text-brown/60 cursor-pointer hover:border-gold-dark transition-colors">
              <Upload size={18} />
              {file ? file.name : form.imagem_url ? 'Trocar foto atual' : 'Escolher imagem'}
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-brown-dark">
              <input type="checkbox" checked={!!form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} className="accent-gold-dark" />
              Ativo no site
            </label>
            <label className="flex items-center gap-2 text-sm text-brown-dark">
              <input type="checkbox" checked={!!form.destaque} onChange={(e) => setForm({ ...form, destaque: e.target.checked })} className="accent-gold-dark" />
              Destaque ("mais pedido")
            </label>
          </div>

          <button type="submit" disabled={saving || uploading} className="btn-primary w-full !bg-brown disabled:opacity-60">
            {uploading ? 'Enviando foto…' : saving ? 'Salvando…' : 'Salvar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
