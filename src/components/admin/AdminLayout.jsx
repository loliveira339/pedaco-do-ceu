import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Cake, Tags, Wheat, Image, Calculator, LogOut, Menu, X, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: Package },
  { to: '/admin/produtos', label: 'Produtos', icon: Cake },
  { to: '/admin/categorias', label: 'Categorias', icon: Tags },
  { to: '/admin/ingredientes', label: 'Ingredientes', icon: Wheat },
  { to: '/admin/galeria', label: 'Galeria', icon: Image },
  { to: '/admin/calculadora', label: 'Calculadora de Preço', icon: Calculator },
];

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-cream-alt flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-brown-dark text-cream shrink-0">
        <SidebarContent onNavigate={() => {}} onLogout={handleLogout} user={user} />
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-brown-dark text-cream flex flex-col">
            <SidebarContent onNavigate={() => setOpen(false)} onLogout={handleLogout} user={user} />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden flex items-center justify-between bg-white border-b border-brown/10 px-4 py-3 sticky top-0 z-30">
          <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="text-brown-dark">
            <Menu size={24} />
          </button>
          <span className="font-script text-lg text-brown-dark">Pedaço do Céu — Admin</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate, onLogout, user }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-5 border-b border-cream/10">
        <div>
          <p className="font-script text-2xl leading-none">Pedaço do Céu</p>
          <p className="text-[11px] text-cream/50 mt-1">Painel administrativo</p>
        </div>
        <button onClick={onNavigate} className="lg:hidden text-cream/70">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-gold text-brown-dark' : 'text-cream/80 hover:bg-cream/10'
              }`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-cream/10">
        <p className="px-3 text-xs text-cream/50 truncate mb-2">{user?.email}</p>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-cream/80 hover:bg-cream/10 transition-colors"
        >
          <LogOut size={18} /> Sair
        </button>
      </div>
    </>
  );
}
