import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Não foi possível entrar.');
      return;
    }
    toast.success('Bem-vinda, Milena!');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/images/logotipo.jpeg" alt="Pedaço do Céu" className="w-16 h-16 rounded-full object-cover mx-auto shadow-soft mb-3" />
          <p className="font-script text-3xl text-brown-dark">Pedaço do Céu</p>
          <p className="text-sm text-brown/60 mt-1">Painel administrativo</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-5 text-xs bg-gold/15 text-brown-dark border border-gold/30 rounded-xl px-4 py-3 leading-relaxed">
            O Supabase ainda não foi configurado neste projeto (arquivo <code>.env</code>). Siga o
            <code> README.md</code> para criar o projeto, rodar o <code>schema.sql</code> e cadastrar
            o primeiro login da Milena antes de acessar o painel.
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-brown-dark uppercase tracking-wide">E-mail</label>
            <div className="mt-1.5 flex items-center gap-2 border border-brown/15 rounded-xl px-3 py-2.5 focus-within:border-gold-dark transition-colors">
              <Mail size={16} className="text-brown/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="milena@pedacodoceu.com.br"
                className="w-full bg-transparent outline-none text-sm text-brown-dark"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-brown-dark uppercase tracking-wide">Senha</label>
            <div className="mt-1.5 flex items-center gap-2 border border-brown/15 rounded-xl px-3 py-2.5 focus-within:border-gold-dark transition-colors">
              <Lock size={16} className="text-brown/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none text-sm text-brown-dark"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !bg-brown disabled:opacity-60">
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <a href="/" className="block text-center text-xs text-brown/50 mt-5 hover:text-brown">← Voltar ao site</a>
      </div>
    </div>
  );
}
