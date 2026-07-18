import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cake, Tags, Wheat, Image, Calculator } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

const CARDS = [
  { key: 'produtos', label: 'Produtos', icon: Cake, to: '/admin/produtos', color: 'bg-savory/10 text-savory' },
  { key: 'categorias', label: 'Categorias', icon: Tags, to: '/admin/categorias', color: 'bg-skyblue/20 text-brown-dark' },
  { key: 'ingredientes', label: 'Ingredientes', icon: Wheat, to: '/admin/ingredientes', color: 'bg-gold/15 text-gold-dark' },
  { key: 'galeria', label: 'Fotos na galeria', icon: Image, to: '/admin/galeria', color: 'bg-rose/15 text-rose' },
];

export default function DashboardPage() {
  const [counts, setCounts] = useState({ produtos: null, categorias: null, ingredientes: null, galeria: null });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const tables = { produtos: 'produtos', categorias: 'categorias', ingredientes: 'ingredientes', galeria: 'galeria' };
      const entries = await Promise.all(
        Object.entries(tables).map(async ([key, table]) => {
          const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
          return [key, count ?? 0];
        })
      );
      setCounts(Object.fromEntries(entries));
    })();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-brown-dark">Olá, Milena 👋</h1>
      <p className="text-brown/60 mt-1 text-sm">Aqui está um resumo do seu site.</p>

      {!isSupabaseConfigured && (
        <div className="mt-5 text-sm bg-gold/15 text-brown-dark border border-gold/30 rounded-xl px-4 py-3 leading-relaxed">
          O painel está funcionando com dados de demonstração porque o Supabase ainda não foi
          configurado. Veja o <strong>README.md</strong> na raiz do projeto para ativar o banco de
          dados real e passar a gerenciar produtos, categorias, ingredientes e fotos de verdade.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {CARDS.map(({ key, label, icon: Icon, to, color }) => (
          <Link key={key} to={to} className="card p-5 hover:shadow-card transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <p className="mt-3 text-2xl font-bold text-brown-dark">
              {counts[key] === null ? '—' : counts[key]}
            </p>
            <p className="text-sm text-brown/60">{label}</p>
          </Link>
        ))}
      </div>

      <Link to="/admin/calculadora" className="card p-6 mt-4 flex items-center gap-4 hover:shadow-card transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-brown-dark text-cream flex items-center justify-center shrink-0">
          <Calculator size={22} />
        </div>
        <div>
          <p className="font-semibold text-brown-dark">Calculadora Inteligente de Precificação</p>
          <p className="text-sm text-brown/60">Calcule custo, preço ideal e margem de lucro de qualquer receita.</p>
        </div>
      </Link>
    </div>
  );
}
