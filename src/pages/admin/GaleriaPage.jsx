import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useCrud } from '../../hooks/useCrud';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import Modal from '../../components/admin/Modal';
import Field from '../../components/admin/Field';

export default function GaleriaPage() {
  const { items, loading, saving, create, remove } = useCrud('galeria', { orderBy: 'ordem' });
  const [modal, setModal] = useState(false);
  const [legenda, setLegenda] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Escolha uma foto.');
      return;
    }
    if (!isSupabaseConfigured) {
      toast.error('Configure o Supabase (.env) para enviar fotos reais.');
      return;
    }
    setUploading(true);
    const path = `galeria/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error: uploadError } = await supabase.storage.from('fotos').upload(path, file);
    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from('fotos').getPublicUrl(path);
    const { error } = await create({ imagem_url: pub.publicUrl, legenda, ordem: items.length });
    setUploading(false);
    if (!error) {
      setModal(false);
      setFile(null);
      setLegenda('');
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remover esta foto da galeria?')) return;
    await remove(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-brown-dark">Galeria</h1>
          <p className="text-sm text-brown/60">Fotos exibidas na seção Galeria do site.</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary !bg-brown !py-2.5 !px-4 text-sm">
          <Plus size={18} /> Nova foto
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-brown/50 text-sm">Carregando…</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-brown/50 text-sm">Nenhuma foto cadastrada ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {items.map((f) => (
            <div key={f.id} className="card overflow-hidden group relative">
              <img src={f.imagem_url} alt={f.legenda || ''} className="w-full aspect-square object-cover" />
              <button
                onClick={() => handleDelete(f.id)}
                className="absolute top-2 right-2 bg-white/90 text-rose p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remover foto"
              >
                <Trash2 size={14} />
              </button>
              {f.legenda && <p className="px-2 py-1.5 text-xs text-brown/60 truncate">{f.legenda}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Nova foto">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-brown-dark uppercase tracking-wide">Arquivo da foto</label>
            <label className="mt-1.5 flex items-center justify-center gap-2 border-2 border-dashed border-brown/20 rounded-xl px-4 py-6 text-sm text-brown/60 cursor-pointer hover:border-gold-dark transition-colors">
              <Upload size={18} />
              {file ? file.name : 'Clique para escolher uma imagem'}
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <Field label="Legenda (opcional)" value={legenda} onChange={setLegenda} />
          <button type="submit" disabled={uploading || saving} className="btn-primary w-full !bg-brown disabled:opacity-60">
            {uploading ? 'Enviando…' : 'Adicionar à galeria'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
