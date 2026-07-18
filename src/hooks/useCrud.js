import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Hook genérico de CRUD sobre uma tabela Supabase, usado por todas as telas
 * administrativas (produtos, categorias, ingredientes, galeria).
 * Mantém o painel simples e consistente sem repetir a mesma lógica em cada página.
 */
export function useCrud(table, { orderBy = 'id', ascending = true, select = '*' } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from(table).select(select).order(orderBy, { ascending });
    if (error) toast.error(`Erro ao carregar ${table}: ${error.message}`);
    setItems(data || []);
    setLoading(false);
  }, [table, orderBy, ascending, select]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (values) => {
    if (!isSupabaseConfigured) {
      toast.error('Configure o Supabase (.env) para salvar dados reais.');
      return { error: true };
    }
    setSaving(true);
    const { data, error } = await supabase.from(table).insert(values).select().single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return { error };
    }
    toast.success('Criado com sucesso!');
    await load();
    return { data };
  };

  const update = async (id, values) => {
    if (!isSupabaseConfigured) {
      toast.error('Configure o Supabase (.env) para salvar dados reais.');
      return { error: true };
    }
    setSaving(true);
    const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return { error };
    }
    toast.success('Atualizado com sucesso!');
    await load();
    return { data };
  };

  const remove = async (id) => {
    if (!isSupabaseConfigured) {
      toast.error('Configure o Supabase (.env) para salvar dados reais.');
      return { error: true };
    }
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      toast.error(error.message);
      return { error };
    }
    toast.success('Removido.');
    await load();
    return {};
  };

  return { items, loading, saving, reload: load, create, update, remove };
}
